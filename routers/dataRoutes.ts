import express from "express";
import { Request, Response } from "express";
import { getHistoricalBars } from "../alpaca_services/data_service";

const dataRoutes = express.Router()

dataRoutes.get("/:symbol_or_asset_id/bars", async (req: Request, res: Response) => {
    try {
        const symbol_or_asset_id = req.params.symbol_or_asset_id
        const timeFrame = req.query.timeFrame as "5Min" | "15Min" | "30Min" | "1Hour" | "1Day" | "1Week" | "1Month" | "12Month"

        const requester = req.user
        if (!requester)
            throw new Error("You are unauthorized for this action")

        const { status, data } = await getHistoricalBars(symbol_or_asset_id, timeFrame)
        if (status !== 200) throw new Error("Something went wrong on alpaca connection")

        return res.json(data)
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ msg: err })
    }
})

export default dataRoutes