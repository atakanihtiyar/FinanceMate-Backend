import express, { Request, Response } from "express";
import { getUser } from "../db/controllers/userController";
import { isUserLoggedIn } from "../middleware";
import { createOrder, getAccountPortfolioHistory, getOrders, getPositions, getTradingDetails } from "../alpaca_services/trading_service";
const tradingRoutes = express.Router()

export interface IRequestWithUser extends Request {
    user?: {
        alpaca_id: string,
        account_number: string,
        is_admin: boolean
    }
}

tradingRoutes.get("/:account_number/account", isUserLoggedIn, async (req: IRequestWithUser, res: Response) => {
    try {
        const account_number = req.params.account_number
        const requester = req.user
        if (!requester || (requester.account_number !== account_number && !requester.is_admin))
            throw new Error("You are unauthorized for this action")

        const foundUser = await getUser(account_number)
        if (!foundUser) throw new Error("User not found")
        const { status, data } = await getTradingDetails(foundUser.alpaca_id)
        if (status === 200)
            return res.json(data)
        else
            throw new Error(data)
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ msg: err })
    }
})

tradingRoutes.get("/:account_number/positions", isUserLoggedIn, async (req: IRequestWithUser, res: Response) => {
    try {
        const account_number = req.params.account_number
        const requester = req.user
        if (!requester || (requester.account_number !== account_number && !requester.is_admin))
            throw new Error("You are unauthorized for this action")

        const foundUser = await getUser(account_number)
        if (!foundUser) throw new Error("User not found")
        const { status, data } = await getPositions(foundUser.alpaca_id)
        if (status === 200)
            return res.json(data)
        else
            throw new Error(data)
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ msg: err })
    }
})

tradingRoutes.get("/:account_number/orders", isUserLoggedIn, async (req: IRequestWithUser, res: Response) => {
    try {
        const account_number = req.params.account_number
        const requester = req.user
        if (!requester || (requester.account_number !== account_number && !requester.is_admin))
            throw new Error("You are unauthorized for this action")

        const foundUser = await getUser(account_number)
        if (!foundUser) throw new Error("User not found")
        const { status, data } = await getOrders(foundUser.alpaca_id)
        if (status === 200)
            return res.json(data)
        else
            throw new Error(data)
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ msg: err })
    }
})

tradingRoutes.post("/:account_number/orders", isUserLoggedIn, async (req: IRequestWithUser, res: Response) => {
    try {
        const account_number = req.params.account_number
        const requester = req.user
        if (!requester || (requester.account_number !== account_number && !requester.is_admin))
            throw new Error("You are unauthorized for this action")

        const foundUser = await getUser(account_number)
        if (!foundUser) throw new Error("User not found")

        const { symbol, qty, side, type, time_in_force, limit_price, stop_price } = req.body
        const { status, data } = await createOrder(foundUser.alpaca_id, { symbol, qty, side, type, time_in_force, limit_price, stop_price })

        if (status === 200)
            return res.json(data)
        else
            throw new Error(data)
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ msg: err })
    }
})

tradingRoutes.get("/:account_number/portfolio_history", isUserLoggedIn, async (req: IRequestWithUser, res: Response) => {
    try {
        const account_number = req.params.account_number
        const requester = req.user
        const timeframe = req.query.timeframe as "5Min" | "15Min" | "1H" | "1D"
        if (!requester || (requester.account_number !== account_number && !requester.is_admin)) throw new Error("You are unauthorized for this action")
        const foundUserId = await getUser(account_number, "alpaca_id")
        if (!foundUserId) throw new Error("There is not a user with this account number")

        const { status, data } = await getAccountPortfolioHistory(foundUserId.alpaca_id, timeframe)

        if (status === 200)
            return res.json(data)
        else
            throw new Error(data)
    }
    catch (err) {
        console.log(err.message)
        return res.status(500).json({ message: err.message })
    }
})

export default tradingRoutes
