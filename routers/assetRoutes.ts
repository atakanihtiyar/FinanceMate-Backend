import express from "express";
import { Request, Response } from "express";
import { getAssetData } from "../alpaca_services/assets_service";
import { getLatestBar } from "../alpaca_services/data_service";

const assetRoutes = express.Router()

assetRoutes.get("/:symbol_or_asset_id", async (req: Request, res: Response) => {
    try {
        const symbol_or_asset_id = req.params.symbol_or_asset_id
        const requester = req.user
        if (!requester)
            throw new Error("You are unauthorized for this action")

        const results = await Promise.all([getAssetData(symbol_or_asset_id), getLatestBar(symbol_or_asset_id)])
        if (!results) throw new Error("Something went wrong on alpaca connection")
        if (results[0]?.status !== 200) throw new Error("Something went wrong on fetching asset data")
        if (results[1]?.status !== 200) throw new Error("Something went wrong on fetching asset price")

        return res.json({
            ...results[0].data,
            latest_closing: results[1].data.closing
        })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ msg: err })
    }
})

export default assetRoutes