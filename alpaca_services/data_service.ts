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

const getStartDate = (timeFrame: string): Date => {
    const now = Date.now()
    const timeFrameMap: { [key: string]: number } = {
        "5Min": 5 * 60 * 1000,
        "15Min": 15 * 60 * 1000,
        "30Min": 30 * 60 * 1000,
        "1Hour": 60 * 60 * 1000,
        "1Day": 24 * 60 * 60 * 1000,
        "1Week": 7 * 24 * 60 * 60 * 1000,
        "1Month": 30 * 24 * 60 * 60 * 1000,
        "12Month": 12 * 90 * 24 * 60 * 60 * 1000,
    }

    const startDate = new Date(now - (timeFrameMap[timeFrame] * 1000 || 0))
    if (startDate.getUTCFullYear() < 2006)
        startDate.setUTCFullYear(2006)

    return startDate
}

export const getHistoricalBars = async (
    symbol_or_asset_id: string,
    timeFrame: "5Min" | "15Min" | "30Min" | "1Hour" | "1Day" | "1Week" | "1Month" | "12Month",
) => {
    const dataLimit = 1000
    const startDate = getStartDate(timeFrame)

    const alpacaRes = await fetch(`${alpacaDataUrl}/stocks/${symbol_or_asset_id}/bars?` + new URLSearchParams({
        timeframe: timeFrame,
        limit: dataLimit.toString(),
        adjustment: "split",
        start: startDate.toISOString()
    }), {
        method: "GET",
        headers: {
            accept: "application/json",
            Authorization: "Basic " + Buffer.from(alpacaKey + ":" + alpacaSecret).toString("base64")
        }
    })

    const alpacaData = await alpacaRes.json()
    return { status: alpacaRes.status, data: alpacaData }
}