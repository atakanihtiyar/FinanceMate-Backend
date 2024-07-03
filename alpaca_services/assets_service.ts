const alpacaUrl = process.env.ALPACA_API_URL || "alpaca_api_url_not_found"
const alpacaKey = process.env.ALPACA_API_KEY || "alpaca_api_key_not_found"
const alpacaSecret = process.env.ALPACA_API_SECRET || "alpaca_api_secret_not_found"

interface Options {
    returnFake?: boolean
}

const extractAssetData = (data) => {
    return {
        exchange: data.exchange,
        symbol: data.symbol,
        name: data.name,
        class: data.class,
        status: data.status,
    }
}

export const getAssetData = async (symbol_or_asset_id: string, opt?: Options) => {
    if (opt?.returnFake) return {
        status: 200,
        data: extractAssetData({
            "id": "904837e3-3b76-47ec-b432-046db621571b",
            "class": "us_equity",
            "exchange": "NASDAQ",
            "symbol": "AAPL",
            "name": "Apple Inc. Common Stock",
            "status": "active",
            "tradable": true,
            "marginable": true,
            "shortable": true,
            "easy_to_borrow": true,
            "fractionable": true,
            "last_close_pct_change": "1",
            "last_price": "202.00",
            "last_close": "200.00",
            "min_order_size": "1",
            "min_trade_increment": "string",
            "price_increment": "string",
            "maintenance_margin_requirement": 0,
            "attributes": [
                "ptp_no_exception",
                "ipo"
            ]
        })
    }

    const alpacaRes = await fetch(`${alpacaUrl}/assets/${symbol_or_asset_id}`, {
        method: "GET",
        headers: {
            accept: "application/json",
            Authorization: "Basic " + Buffer.from(alpacaKey + ":" + alpacaSecret).toString("base64")
        },
    })

    let alpacaData = await alpacaRes.json()
    if (alpacaRes.status === 200) alpacaData = extractAssetData(alpacaData)
    return { status: alpacaRes.status, data: alpacaData }
}