const alpacaDataUrl = process.env.ALPACA_DATA_API_URL || "alpaca_data_api_url_not_found"
const alpacaKey = process.env.ALPACA_API_KEY || "alpaca_api_key_not_found"
const alpacaSecret = process.env.ALPACA_API_SECRET || "alpaca_api_secret_not_found"

interface Options {
    returnFake?: boolean
}

const extractLatestBar = (data) => {
    return {
        time: data.bar.t,
        opening: data.bar.o,
        high: data.bar.h,
        low: data.bar.l,
        closing: data.bar.c,
        bar_volume: data.bar.v,
        bar_trade_count: data.bar.n,
        average: data.bar.vw,
        symbol: data.symbol,
    }
}

export const getLatestBar = async (symbol_or_asset_id: string, opt?: Options) => {
    if (opt?.returnFake) return {
        status: 200,
        data: extractLatestBar({
            "bar": {
                "t": "2022-08-17T09:07:00Z", // date-time - Timestamp in RFC-3339 format with nanosecond precision
                "o": 172.98, // double - Opening price
                "h": 173.04, // double - High price
                "l": 172.98, // double - Low price
                "c": 173, // double - Closing price
                "v": 2748, // int - Bar volume
                "n": 49, // int - Trade count in the bar
                "vw": 173.007817 // double - Volume weighted average price
            },
            "symbol": "AAPL"
        })
    }

    const alpacaRes = await fetch(`${alpacaDataUrl}/stocks/${symbol_or_asset_id}/bars/latest`, {
        method: "GET",
        headers: {
            accept: "application/json",
            Authorization: "Basic " + Buffer.from(alpacaKey + ":" + alpacaSecret).toString("base64")
        },
    })

    let alpacaData = await alpacaRes.json()
    if (alpacaRes.status === 200) alpacaData = extractLatestBar(alpacaData)
    return { status: alpacaRes.status, data: alpacaData }
}

export const getHistoricalBars = async (symbol_or_asset_id: string, timeFrame: "1Hour" | "1Day", opt?: Options) => {
    if (opt?.returnFake) return {
        status: 200,
        data: {
            "bars": [
                {
                    "t": "2022-01-03T09:00:00Z",
                    "o": 178.26,
                    "h": 178.26,
                    "l": 178.21,
                    "c": 178.21,
                    "v": 1118,
                    "n": 65,
                    "vw": 178.235733
                },
                {
                    "t": "2022-01-03T09:00:00Z",
                    "o": 178.26,
                    "h": 178.26,
                    "l": 178.21,
                    "c": 178.21,
                    "v": 1118,
                    "n": 65,
                    "vw": 178.235733
                },
                {
                    "t": "2022-01-03T09:00:00Z",
                    "o": 178.26,
                    "h": 178.26,
                    "l": 178.21,
                    "c": 178.21,
                    "v": 1118,
                    "n": 65,
                    "vw": 178.235733
                }
            ],
            "symbol": "AAPL",
            "next_page_token": "QUFQTHxNfDIwMjItMDEtMDNUMDk6MDA6MDAuMDAwMDAwMDAwWg=="
        }
    }
    const start = timeFrame === "1Hour" ? new Date(Date.now() - 1000 * 60 * 60 * 24 * 5) :
        timeFrame === "1Day" ? new Date(Date.now() - 1000 * 60 * 60 * 24 * 60) :
            timeFrame === "1Week" ? new Date(Date.now() - 1000 * 60 * 60 * 24 * 7 * 30) : new Date(Date.now())
    const alpacaRes = await fetch(`${alpacaDataUrl}/stocks/${symbol_or_asset_id}/bars?` + new URLSearchParams({
        timeframe: timeFrame,
        limit: "1000",
        adjustment: "raw",
        start: start.toISOString()
    }), {
        method: "GET",
        headers: {
            accept: "application/json",
            Authorization: "Basic " + Buffer.from(alpacaKey + ":" + alpacaSecret).toString("base64")
        }
    })

    let alpacaData = await alpacaRes.json()
    return { status: alpacaRes.status, data: alpacaData }
}