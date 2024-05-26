import express, { Request, Response } from "express";
import { getUser } from "../db/controllers/userController";
import { isUserLoggedIn } from "../middleware";
import { getOrders, getPositions, getTradingDetails } from "../alpaca_services/trading_service";
const tradingRoutes = express.Router()

export interface IRequestWithUser extends Request {
    user?: {
        account_number: string,
        is_admin: boolean
    }
}

tradingRoutes.get("/:account_number", isUserLoggedIn, async (req: IRequestWithUser, res: Response) => {
    try {
        const account_number = req.params.account_number
        const requester = req.user
        if (!requester || (requester.account_number !== account_number && !requester.is_admin))
            throw new Error("You are unauthorized for this action")

        const foundUser = await getUser(account_number)
        if (!foundUser) throw new Error("User not found")

        const results = await Promise.all([getTradingDetails(foundUser.alpaca_id), getPositions(foundUser.alpaca_id), getOrders(foundUser.alpaca_id)])
        if (results[0].status !== 200 || results[1].status !== 200 || results[2].status !== 200) throw new Error("Data couldn't fetch from alpaca")
        const resData = {
            ...results[0].data,
            positions: [
                ...results[1].data
            ],
            orders: [
                ...results[2].data
            ]
        }
        return res.json(resData)
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ msg: "Something went wrong", err })
    }
})

export default tradingRoutes
