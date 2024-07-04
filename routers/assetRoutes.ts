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
            return res.status(401).json({ msg: "You are unauthorized for this action" })

        const results = await Promise.all([getAssetData(symbol_or_asset_id), getLatestBar(symbol_or_asset_id)])
        if (!results) throw new Error("Something went wrong on alpaca connection")
        if (results[0] && results[0].status !== 200)
            return res.status(results[0].status).json({ msg: results[0].data.message })
        if (results[1] && results[1].status !== 200)
            return res.status(results[1].status).json({ msg: results[1].data.message })

        return res.json({
            ...results[0].data,
            latest_closing: results[1].data.closing
        })
    }
    catch (err) {
        console.log(err.message)
        return res.status(500).json({ msg: err.message })
    }
})

export default assetRoutes