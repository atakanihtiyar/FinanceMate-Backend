import User from "../models/User";
import { Request, Response } from "express";

interface IRequestWithUser extends Request {
    user: {
        account_number: string,
        is_active: boolean,
        is_admin: boolean
    }
}

export async function createUser(req: IRequestWithUser, res: Response) {
    try {
        const { account_number, given_name, family_name, phone_number, email_address, password } = req.body
        const ip_address = req.socket.remoteAddress
        let created_at, updated_at
        created_at = updated_at = new Date()

        const user = new User({
            account_number,
            given_name,
            family_name,
            email_address,
            phone_number,
            created_at,
            updated_at,
            ip_address
        })
        const registeredUser = await User.register(user, password)
        if (!registeredUser)
            throw new Error("New user couldn't save to database")

        return res.status(200).json({ message: "New user created", account_number, given_name })
    }
    catch (err) {
        console.log("ERROR: ", err.message)
        return res.status(500).json({ message: "Something went wrong when creating user" })
    }
}

export async function getUser(req: IRequestWithUser, res: Response) {
    try {
        const account_number_to = req.params.account_number
        const user_from = req.user

        if (!user_from || (user_from.account_number !== account_number_to && !user_from.is_admin))
            throw new Error("You are unauthorized for this action")

        const foundUser = await User.findOne({ account_number: account_number_to })
        if (!foundUser)
            throw new Error("User not found")

        return res.status(200).json({ message: "User info fetched", account_number: foundUser.account_number, name: foundUser.given_name })
    }
    catch (err) {
        console.log("ERROR: ", err.message)
        return res.status(500).json({ message: err.message })
    }
}

export async function updateUser(req: IRequestWithUser, res: Response) {
    try {
        const account_number_to = req.params.account_number.toString()
        const user_from = req.user
        if (!user_from || (user_from.account_number !== account_number_to && !user_from.is_admin))
            throw new Error("You are unauthorized for this action")

        const foundUser = await User.findOne({ account_number: account_number_to })
        if (!foundUser)
            throw new Error("User not found")

        const { given_name, family_name, phone_number, email_address } = req.body
        const updated_at = new Date()

        foundUser.given_name = given_name
        foundUser.family_name = family_name
        foundUser.email_address = email_address
        foundUser.phone_number = phone_number
        foundUser.updated_at = updated_at
        const updatedUser = await foundUser.save()

        if (!updatedUser)
            throw new Error("Account couldn't update")

        return res.status(200).send({ message: "User updated" })
    }
    catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

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