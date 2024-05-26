import express, { Request, Response } from "express";
import { createUser, getUser, updateUser, closeUser, reopenUser } from "../db/controllers/userController";
import { isUserLoggedIn } from "../middleware";
import User from "../db/models/User";
import { closeAlpacaUser, createAlpacaUser, reopenAlpacaUser, updateAlpacaUser } from "../alpaca_services/accounts_service";
const userRoutes = express.Router()

export interface IRequestWithUser extends Request {
    user?: {
        account_number: string,
        is_admin: boolean
    }
}

userRoutes.post("/", async (req: IRequestWithUser, res: Response) => {
    try {
        const { password, identity, contact, disclosures, agreements } = req.body
        const ip_address = (req.headers["x-forwarded-for"] || req.socket.remoteAddress)

        // ALPACA COMMUNICATION
        const { status, data } = await createAlpacaUser({
            identity,
            contact,
            disclosures,
            agreements: agreements.map(item => {
                return {
                    ...item,
                    ip_address: ip_address
                }
            })
        })
        if (status !== 200) throw new Error(status + ": " + data)

        data.ip_address = ip_address
        data.tax_id = data.tax_id ? data.tax_id : identity.tax_id
        const user = await createUser(data, password)

        // LOGIN AFTER REGISTER
        req.logIn(user, (err) => {
            if (err) return res.status(401).json({ result: false, user: null })
            return res.status(201).json({ result: true, user: { account_number: user.account_number, given_name: user.given_name } })
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ msg: "Something went wrong", err })
    }
})

userRoutes.get("/:account_number", isUserLoggedIn, async (req: IRequestWithUser, res: Response) => {
    try {
        const account_number = req.params.account_number
        const requester = req.user
        if (!requester || (requester.account_number !== account_number && !requester.is_admin))
            throw new Error("You are unauthorized for this action")

        const foundUser = await getUser(account_number)
        return res.status(200).json({ account_number: foundUser.account_number, name: foundUser.given_name })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ msg: "Something went wrong", err })
    }
})

userRoutes.put("/:account_number", isUserLoggedIn, async (req: IRequestWithUser, res: Response) => {
    try {
        const { identity, contact, disclosures } = req.body
        const account_number = req.params.account_number
        const requester = req.user
        if (!requester || (requester.account_number !== account_number && !requester.is_admin)) throw new Error("You are unauthorized for this action")
        const foundUser = await getUser(account_number)
        if (!foundUser) throw new Error("There is not a user with this account number")

        const { status, data } = await updateAlpacaUser({
            identity,
            contact,
            disclosures
        }, foundUser)
        if (status !== 200) throw new Error(status + ": " + data.message)

        const updatedUser = await updateUser(data)
        if (!updatedUser) throw new Error("Updated user couldn't save")

        return res.status(200).send({ message: "User updated" })
    }
    catch (err) {
        return res.status(500).json({ message: err.message })
    }
})

userRoutes.post("/:account_number/close", isUserLoggedIn, async (req: IRequestWithUser, res: Response) => {
    try {
        const account_number = req.params.account_number
        const requester = req.user
        if (!requester || (requester.account_number !== account_number && !requester.is_admin)) throw new Error("You are unauthorized for this action")
        const foundUserId = await getUser(account_number, "alpaca_id")
        if (!foundUserId) throw new Error("There is not a user with this account number")

        const closedAlpacaUser = closeAlpacaUser(foundUserId)
        if (!closedAlpacaUser) throw new Error("alpaca error: user couldn't close on alpaca")

        const closedUser = closeUser(account_number)
        if (!closedUser) throw new Error("mongo error: user couldn't close on db")
        return res.status(200).json({ message: "User closed" })
    }
    catch (err) {
        return res.status(500).json({ message: err.message })
    }
})

userRoutes.post("/:account_number/reopen", isUserLoggedIn, async (req: IRequestWithUser, res: Response) => {
    try {
        const account_number = req.params.account_number
        const requester = req.user
        if (!requester || !requester.is_admin) throw new Error("You are unauthorized for this action")
        const foundUserId = await getUser(account_number, "alpaca_id")
        if (!foundUserId) throw new Error("There is not a user with this account number")

        const reopenedAlpacaUser = reopenAlpacaUser(foundUserId)
        if (!reopenedAlpacaUser) throw new Error("alpaca error: user couldn't reopen on alpaca")

        const reopenedUser = reopenUser(account_number)
        if (!reopenedUser) throw new Error("mongo error: user couldn't reopen on db")
        return res.status(200).json({ message: "User reopened" })
    }
    catch (err) {
        return res.status(500).json({ message: err.message })
    }
})

export default userRoutes
