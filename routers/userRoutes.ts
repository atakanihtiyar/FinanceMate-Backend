import express, { Request, Response } from "express";
import { createUser, getUser, updateUser, closeUser, reopenUser } from "../db/controllers/userController";
import { isUserLoggedIn } from "../middleware";
import { closeAlpacaUser, createAchRelationship, createAlpacaUser, deleteAchRelationship, getAchRelationships, createTransfer, reopenAlpacaUser, updateAlpacaUser, TransferData, getTransfers } from "../alpaca_services/accounts_service";
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
        if (status !== 200)
            return res.status(status).json({ msg: data.message })

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
            return res.status(401).json({ msg: "You are unauthorized for this action" })

        const foundUser = await getUser(account_number)
        if (!foundUser)
            return res.status(404).json({ msg: "There is not a user with this account number" })

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
        if (!requester || (requester.account_number !== account_number && !requester.is_admin))
            return res.status(401).json({ msg: "You are unauthorized for this action" })

        const foundUser = await getUser(account_number)
        if (!foundUser)
            return res.status(404).json({ msg: "There is not a user with this account number" })

        const { status, data } = await updateAlpacaUser({
            identity,
            contact,
            disclosures
        }, foundUser)
        if (status !== 200)
            return res.status(status).json({ msg: data.message })

        const updatedUser = await updateUser(data)
        if (!updatedUser) throw new Error("Updated user couldn't save to db")

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
        if (!requester || (requester.account_number !== account_number && !requester.is_admin))
            return res.status(401).json({ msg: "You are unauthorized for this action" })

        const foundUserId = await getUser(account_number, "alpaca_id")
        if (!foundUserId)
            return res.status(404).json({ msg: "There is not a user with this account number" })

        const { status } = await closeAlpacaUser(foundUserId)
        if (status !== 204)
            return res.status(status).json({ msg: "User couldn't closed on alpaca" })

        const closedUser = closeUser(account_number)
        if (!closedUser) throw new Error("Closed user couldn't save to db")

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
        if (!requester || !requester.is_admin)
            return res.status(401).json({ msg: "You are unauthorized for this action" })

        const foundUserId = await getUser(account_number, "alpaca_id")
        if (!foundUserId)
            return res.status(404).json({ msg: "There is not a user with this account number" })

        const { status } = await reopenAlpacaUser(foundUserId)
        if (status !== 200)
            return res.status(status).json({ msg: "User couldn't reopen on alpaca" })

        const reopenedUser = await reopenUser(account_number)
        if (!reopenedUser) throw new Error("Reopened user couldn't save to db")

        return res.status(200).json({ message: "User reopened" })
    }
    catch (err) {
        return res.status(500).json({ message: err.message })
    }
})

userRoutes.get("/:account_number/ach", isUserLoggedIn, async (req: IRequestWithUser, res: Response) => {
    try {
        const account_number = req.params.account_number
        const requester = req.user
        if (!requester || (requester.account_number !== account_number && !requester.is_admin))
            return res.status(401).json({ msg: "You are unauthorized for this action" })

        const foundUserId = await getUser(account_number, "alpaca_id")
        if (!foundUserId)
            return res.status(404).json({ msg: "There is not a user with this account number" })

        const { status, data } = await getAchRelationships(foundUserId.alpaca_id)
        if (status !== 200)
            return res.status(status).json({ msg: data.message })

        return res.status(200).json(data)
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ msg: "Something went wrong", err })
    }
})

userRoutes.post("/:account_number/ach", isUserLoggedIn, async (req: IRequestWithUser, res: Response) => {
    try {
        const account_number = req.params.account_number
        const requester = req.user
        if (!requester || (requester.account_number !== account_number && !requester.is_admin))
            return res.status(401).json({ msg: "You are unauthorized for this action" })

        const foundUserId = await getUser(account_number, "alpaca_id")
        if (!foundUserId)
            return res.status(404).json({ msg: "There is not a user with this account number" })

        const nickname = req.body.nickname as string
        const account_owner_name = req.body.account_owner_name as string
        const bank_account_type = req.body.bank_account_type as "CHECKING" | "SAVINGS"
        const bank_account_number = req.body.bank_account_number as string
        const bank_routing_number = req.body.bank_routing_number as string | undefined

        const { status, data } = await createAchRelationship(foundUserId.alpaca_id, {
            nickname,
            account_owner_name,
            bank_account_type,
            bank_account_number,
            bank_routing_number,
        })

        if (status !== 200)
            return res.status(status).json({ msg: data.message })

        return res.status(200).json(data)
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ msg: "Something went wrong", err })
    }
})

userRoutes.delete("/:account_number/ach/:ach_relationship_id", isUserLoggedIn, async (req: IRequestWithUser, res: Response) => {
    try {
        const account_number = req.params.account_number
        const ach_relationship_id = req.params.ach_relationship_id
        const requester = req.user
        if (!requester || (requester.account_number !== account_number && !requester.is_admin))
            return res.status(401).json({ msg: "You are unauthorized for this action" })

        const foundUserId = await getUser(account_number, "alpaca_id")
        if (!foundUserId)
            return res.status(404).json({ msg: "There is not a user with this account number" })

        const { status } = await deleteAchRelationship(foundUserId.alpaca_id, ach_relationship_id)

        if (status !== 204)
            return res.status(status).json({ msg: "Ach relationship couldn't delete on alpaca" })

        return res.status(204).json()
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ msg: "Something went wrong", err })
    }
})

userRoutes.post("/:account_number/ach/transfers", isUserLoggedIn, async (req: IRequestWithUser, res: Response) => {
    try {
        const account_number = req.params.account_number
        const requester = req.user
        if (!requester || (requester.account_number !== account_number && !requester.is_admin))
            return res.status(401).json({ msg: "You are unauthorized for this action" })

        const foundUserId = await getUser(account_number, "alpaca_id")
        if (!foundUserId)
            return res.status(404).json({ msg: "There is not a user with this account number" })

        const transferData: TransferData = req.body

        const { status, data } = await createTransfer(foundUserId.alpaca_id, transferData)

        if (status !== 200)
            return res.status(status).json({ msg: data.message })

        return res.status(200).json(data)
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ msg: "Something went wrong", err })
    }
})

userRoutes.get("/:account_number/ach/transfers", isUserLoggedIn, async (req: IRequestWithUser, res: Response) => {
    try {
        const account_number = req.params.account_number
        const requester = req.user
        if (!requester || (requester.account_number !== account_number && !requester.is_admin))
            return res.status(401).json({ msg: "You are unauthorized for this action" })

        const foundUserId = await getUser(account_number, "alpaca_id")
        if (!foundUserId)
            return res.status(404).json({ msg: "There is not a user with this account number" })

        const { status, data } = await getTransfers(foundUserId.alpaca_id)

        if (status !== 200)
            return res.status(status).json({ msg: data.message })

        return res.status(200).json(data)
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ msg: "Something went wrong", err })
    }
})

export default userRoutes
