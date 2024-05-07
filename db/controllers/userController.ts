import { createAlpacaUser, updateAlpacaUser } from "../../alpaca/accounts";
import User from "../models/User";
import { Request, Response } from "express";
export interface IRequestWithUser extends Request {
    user?: {
        account_number: string,
        is_active: boolean,
        is_admin: boolean
    }
}

export async function createUser(req: IRequestWithUser, res: Response) {
    try {
        const { password, calling_code, phone_number, identity, contact, disclosures, agreements } = req.body
        const full_phone_number = `+${calling_code}${phone_number}`
        const ip_address = (req.headers["x-forwarded-for"] || req.socket.remoteAddress)

        // MONGO VALIDATION
        const user = new User({
            given_name: identity.given_name,
            family_name: identity.family_name,
            email_address: contact.email_address,
            tax_id: identity.tax_id,
            tax_id_type: identity.tax_id_type,
            country_of_tax_residence: identity.country_of_tax_residence,
            phone_number: full_phone_number,
            ip_address: ip_address,
            alpaca: {
                identity,
                contact,
                disclosures,
                agreements: agreements.map(item => {
                    return {
                        ...item,
                        ip_address: ip_address
                    }
                })
            }
        })
        const validationErr = await user.validate({
            pathsToSkip: [
                "account_number",
                "alpaca.id",
                "alpaca.account_number",
                "alpaca.account_type",
                "alpaca.status",
                "alpaca.crypto_status",
                "alpaca.currency",
                "alpaca.created_at",
                "alpaca.last_equity",
                "alpaca.enabled_assets"
            ]
        }).then(() => null, err => err)
        if (validationErr) throw new Error("validation error: " + validationErr)

        // ALPACA COMMUNICATION
        const { status, data } = await createAlpacaUser({
            identity,
            contact: {
                ...contact,
                phone_number: full_phone_number
            },
            disclosures,
            agreements: agreements.map(item => {
                return {
                    ...item,
                    ip_address: ip_address
                }
            })
        })
        if (status !== 200) throw new Error(status + ": " + data)
        user.alpaca.alpaca_id = data.id
        user.account_number = data.account_number
        user.ip_address = ip_address
        user.alpaca = {
            alpaca_id: data.id,
            account_number: data.account_number,
            account_type: data.account_type,
            status: data.status,
            crypto_status: data.crypto_status,
            currency: data.currency,
            created_at: data.created_at,
            last_equity: data.last_equity,
            enabled_assets: data.enabled_assets,
            identity: {
                ...data.identity
            },
            contact: {
                ...data.contact
            },
            disclosures: {
                ...data.disclosures
            },
            agreements: {
                ...data.agreements
            }
        }

        // SAVE TO MONGO
        const registeredUser = await User.register(user, password)
        if (!registeredUser) throw new Error("New user couldn't save to database")

        // LOGIN AFTER REGISTER
        req.logIn(user, (err) => {
            if (err) return res.status(401).json({ result: false, user: null })
            return res.status(201).json({ result: true, user: { account_number: user.account_number, given_name: user.given_name } })
        })
    }
    catch (err) {
        console.dir(err)
        return res.status(500).json({ message: "Something went wrong when creating user", err })
    }
}

export async function getUser(req: IRequestWithUser, res: Response) {
    try {
        const account_number = req.params.account_number
        const user_from = req.user

        if (!user_from || (user_from.account_number !== account_number && !user_from.is_admin))
            throw new Error("You are unauthorized for this action")

        const foundUser = await User.findOne({ account_number: account_number })
        if (!foundUser)
            throw new Error("User not found")

        return res.status(200).json({ message: "User info fetched", account_number: foundUser.account_number, name: foundUser.given_name, foundUser })
    }
    catch (err) {
        console.log(err.message)
        return res.status(500).json({ message: err.message })
    }
}

// should be update for alpaca
export async function updateUser(req: IRequestWithUser, res: Response) {
    try {
        const { calling_code, phone_number, identity, contact, disclosures } = req.body
        const full_phone_number = `+${calling_code}${phone_number}`
        const account_number = req.params.account_number
        const requester = req.user

        if (!requester || (requester.account_number !== account_number && !requester.is_admin))
            throw new Error("You are unauthorized for this action")

        const foundUser = await User.findOne({ account_number: account_number })
        if (!foundUser)
            throw new Error("User couldn't found")
        if (!foundUser.is_active)
            throw new Error("User is not active")

        // MONGO VALIDATION
        foundUser.family_name = identity.family_name
        foundUser.email_address = contact.email_address
        foundUser.tax_id = identity.tax_id
        foundUser.tax_id_type = identity.tax_id_type
        foundUser.country_of_tax_residence = identity.country_of_tax_residence
        foundUser.phone_number = full_phone_number
        foundUser.alpaca.identity = {
            ...foundUser.alpaca.identity,
            ...identity,
            tax_id: foundUser.tax_id
        }
        foundUser.alpaca.contact = {
            ...foundUser.alpaca.contact,
            ...contact
        }
        foundUser.alpaca.disclosures = {
            ...foundUser.alpaca.disclosures,
            ...disclosures
        }
        const validationErr = await foundUser.validate({
            validateModifiedOnly: true
        }).then(() => null, err => err)
        if (validationErr) throw new Error("validation error: " + validationErr)

        // ALPACA COMMUNICATION
        const { status, data } = await updateAlpacaUser({
            identity,
            contact,
            disclosures
        }, foundUser.alpaca.alpaca_id)
        if (status !== 200) throw new Error(status + ": " + data)
        foundUser.alpaca = { ...data }

        const updatedUser = await foundUser.save()
        if (!updatedUser)
            throw new Error("Account couldn't update")

        return res.status(200).send({ message: "User updated" })
    }
    catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

// should be update for alpaca
export async function closeUser(req: IRequestWithUser, res: Response) {
    try {
        const account_number_to = req.params.account_number
        const user_from = req.user
        if (!user_from || (user_from.account_number !== account_number_to && !user_from.is_admin))
            throw new Error("You are unauthorized for this action")

        const foundUser = await User.findOne({ account_number: account_number_to })
        if (!foundUser)
            throw new Error("User not found")

        if (!foundUser.is_active)
            throw new Error("This account is already closed")

        foundUser.is_active = false
        const closedUser = await foundUser.save()
        if (!closedUser)
            throw new Error("Account couldn't close")

        return res.status(200).json({ message: "User closed" })
    }
    catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

// should be update for alpaca
export async function reopenUser(req: IRequestWithUser, res: Response) {
    try {
        const account_number_to = req.params.account_number
        const user_from = req.user
        if (!user_from || !user_from.is_admin)
            throw new Error("You are unauthorized for this action")

        const foundUser = await User.findOne({ account_number: account_number_to })
        if (!foundUser)
            throw new Error("User not found")

        if (foundUser.is_active)
            throw new Error("This account is already open")

        foundUser.is_active = true
        const reopenedUser = await foundUser.save()
        if (!reopenedUser)
            throw new Error("Account couldn't reopen")

        return res.status(200).json({ message: "User reopened" })
    }
    catch (err) {
        return res.status(500).json({ message: err.message })
    }
}