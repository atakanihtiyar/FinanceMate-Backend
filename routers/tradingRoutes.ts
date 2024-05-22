import express, { Request, Response } from "express";
import { getUser } from "../db/controllers/userController";
import { isUserLoggedIn } from "../middleware";
import { getOrders, getPositions, getTradingDetails } from "../alpaca/trading";
const tradingRoutes = express.Router()

export interface IRequestWithUser extends Request {
    user?: {
        account_number: string,
        is_admin: boolean
    }
}

tradingRoutes.get("/:alpaca_number", isUserLoggedIn, async (req: IRequestWithUser, res: Response) => {
    try {
        const account_number = req.params.account_number

        const result = await Promise.all([getTradingDetails(account_number, { returnFake: true }), getPositions(account_number, { returnFake: true }), getOrders(account_number, { returnFake: true })])
        console.log(result)
        if (result[0].status !== 200 || result[1].status !== 200 || result[2].status !== 200) throw new Error("Data couldn't fetch from alpaca")
        const resData = {
            ...result[0].data,
            positions: [
                ...result[1].data
            ],
            orders: [
                ...result[2].data
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
