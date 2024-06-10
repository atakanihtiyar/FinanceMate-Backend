const alpacaUrl = process.env.ALPACA_API_URL || "alpaca_api_url_not_found"
const alpacaKey = process.env.ALPACA_API_KEY || "alpaca_api_key_not_found"
const alpacaSecret = process.env.ALPACA_API_SECRET || "alpaca_api_secret_not_found"

interface Options {
    returnFake?: boolean
}

const extractTradingData = (data) => {
    return {
        currency: data.currency,
        portfolio_value: data.equity,
        buying_power: data.buying_power,
        cash: data.cash,
        long_market_value: data.long_market_value,
        short_market_value: data.short_market_value,
        last_portfolio_value: data.last_equity,
        last_buying_power: data.last_buying_power,
        last_cash: data.last_cash,
        last_long_market_value: data.last_long_market_value,
        last_short_market_value: data.last_short_market_value,
    }
}

export const getTradingDetails = async (account_id: string, opt?: Options) => {
    if (opt?.returnFake) return {
        status: 200,
        data: extractTradingData({
            "id": "c8f1ef5d-edc0-4f23-9ee4-378f19cb92a4",
            "account_number": "927584925",
            "status": "ACTIVE",
            "currency": "USD",
            "buying_power": "12345.67",
            "regt_buying_power": "12345.67",
            "daytrading_buying_power": "12345.67",
            "options_buying_power": "12345.67",
            "cash": "200.00",
            "cash_withdrawable": "12345.67",
            "cash_transferable": "12345.67",
            "pending_transfer_out": "12345.67",
            "portfolio_value": "12345.67",
            "pattern_day_trader": false,
            "trading_blocked": false,
            "transfers_blocked": false,
            "account_blocked": false,
            "created_at": "2021-03-01T13:28:49.270232Z",
            "trade_suspended_by_user": false,
            "multiplier": "2",
            "shorting_enabled": false,
            "equity": "275.00",
            "last_equity": "200.00",
            "long_market_value": "75.00",
            "short_market_value": "0",
            "initial_margin": "12345.67",
            "maintenance_margin": "12345.67",
            "last_maintenance_margin": "12345.67",
            "sma": "12345.67",
            "daytrade_count": 0,
            "previous_close": "2021-04-01T19:00:00-04:00",
            "last_long_market_value": "100.00",
            "last_short_market_value": "0",
            "last_cash": "100.00",
            "last_initial_margin": "12345.67",
            "last_regt_buying_power": "12345.67",
            "last_daytrading_buying_power": "12345.67",
            "last_options_buying_power": "12345.67",
            "last_buying_power": "12345.67",
            "last_daytrade_count": 0,
            "clearing_broker": "Velox",
            "options_approved_level": 2,
            "options_trading_level": 2,
            "pending_reg_taf_fees": "0.01"
        })
    }

    const alpacaRes = await fetch(`${alpacaUrl}/trading/accounts/${account_id}/account`, {
        method: "GET",
        headers: {
            accept: "application/json",
            Authorization: "Basic " + Buffer.from(alpacaKey + ":" + alpacaSecret).toString("base64")
        },
    })
    let alpacaData = await alpacaRes.json()
    if (alpacaRes.status === 200) alpacaData = extractTradingData(alpacaData)
    return { status: alpacaRes.status, data: alpacaData }
}

const extractPositions = (data) => {
    return data.map((item, index) => {
        if (index > 10) return null
        return {
            symbol: item.symbol,
            exchange: item.exchange,
            avg_entry_price: item.avg_entry_price,
            qty: item.qty,
            side: item.side,
            cost_basis: item.cost_basis,
            market_value: item.market_value,
            unrealized_pl: item.unrealized_pl,
            unrealized_plpc: item.unrealized_plpc,
            unrealized_intraday_pl: item.unrealized_intraday_pl,
            unrealized_intraday_plpc: item.unrealized_intraday_plpc,
            current_price: item.current_price,
            change_today: item.change_today,
        }
    })
}

export const getPositions = async (account_id: string, opt?: Options) => {
    if (opt?.returnFake) return {
        status: 200,
        data: extractPositions([
            {
                "asset_id": "904837e3-3b76-47ec-b432-046db621571b",
                "symbol": "AAPL",
                "exchange": "NASDAQ",
                "asset_class": "us_equity",
                "asset_marginable": true,
                "avg_entry_price": "100.0",
                "qty": "5",
                "side": "long",
                "market_value": "600.0",
                "cost_basis": "500.0",
                "unrealized_pl": "100.0",
                "unrealized_plpc": "0.20",
                "unrealized_intraday_pl": "10.0",
                "unrealized_intraday_plpc": "0.0084",
                "current_price": "120.0",
                "lastday_price": "119.0",
                "change_today": "0.0084",
                "swap_rate": "1.50",
                "avg_entry_swap_rate": "1.40",
                "usd": {
                    "avg_entry_price": "71.43",
                    "market_value": "400.00",
                    "cost_basis": "333.33",
                    "unrealized_pl": "66.67",
                    "unrealized_plpc": "0.2",
                    "unrealized_intraday_pl": "6.67",
                    "unrealized_intraday_plpc": "0.0084",
                    "current_price": "80.0",
                    "lastday_price": "79.33",
                    "change_today": "0.67"
                }
            }
        ])
    }

    const alpacaRes = await fetch(`${alpacaUrl}/trading/accounts/${account_id}/positions`, {
        method: "GET",
        headers: {
            accept: "application/json",
            Authorization: "Basic " + Buffer.from(alpacaKey + ":" + alpacaSecret).toString("base64")
        },
    })
    let alpacaData = await alpacaRes.json()
    if (alpacaRes.status === 200) alpacaData = extractPositions(alpacaData)
    return { status: alpacaRes.status, data: alpacaData }
}

const extractOrders = (data) => {
    return data.map((item) => {
        return {
            order_id: item.id,
            symbol: item.symbol,
            filled_at: item.filled_at,
            created_at: item.created_at,
            qty: item.qty,
            filled_qty: item.filled_qty,
            filled_avg_price: item.filled_avg_price,
            type: item.type,
            side: item.side,
            limit_price: item.limit_price,
            stop_price: item.stop_price,
            commission: item.commission,
        }
    })
}

export const getOrders = async (account_id: string, opt?: Options) => {
    if (opt?.returnFake) return {
        status: 200,
        data: extractOrders([
            {
                "id": "5042d121-f9d3-4e64-a680-3e1faadc2114",
                "client_order_id": "05e41e5a-4f6f-42da-90e2-caedac12b926",
                "created_at": "2024-04-04T14:56:29.216131Z",
                "updated_at": "2024-04-04T14:56:29.276068Z",
                "submitted_at": "2024-04-04T14:56:29.224031Z",
                "filled_at": "2024-04-04T14:56:29.272053Z",
                "expired_at": null,
                "canceled_at": null,
                "failed_at": null,
                "replaced_at": null,
                "replaced_by": null,
                "replaces": null,
                "asset_id": "b0b6dd9d-8b9b-48a9-ba46-b9d54906e415",
                "symbol": "AAPL",
                "asset_class": "us_equity",
                "notional": null,
                "qty": "1",
                "filled_qty": "1",
                "filled_avg_price": "170.98",
                "order_class": "",
                "order_type": "market",
                "type": "market",
                "side": "buy",
                "time_in_force": "day",
                "limit_price": null,
                "stop_price": null,
                "status": "filled",
                "extended_hours": false,
                "legs": null,
                "trail_percent": null,
                "trail_price": null,
                "hwm": null,
                "commission": "0",
                "subtag": null,
                "source": "broker_dashboard"
            }
        ])
    }

    const alpacaRes = await fetch(`${alpacaUrl}/trading/accounts/${account_id}/orders?status=all`, {
        method: "GET",
        headers: {
            accept: "application/json",
            Authorization: "Basic " + Buffer.from(alpacaKey + ":" + alpacaSecret).toString("base64")
        },
    })
    let alpacaData = await alpacaRes.json()
    if (alpacaRes.status === 200) alpacaData = extractOrders(alpacaData)
    return { status: alpacaRes.status, data: alpacaData }
}

const extractCreateOrder = (data) => {
    return {
        order_id: data.id,
        symbol: data.symbol,
        filled_at: data.filled_at,
        created_at: data.created_at,
        qty: data.qty,
        filled_qty: data.filled_qty,
        filled_avg_price: data.filled_avg_price,
        type: data.type,
        side: data.side,
        limit_price: data.limit_price,
        stop_price: data.stop_price,
        commission: data.commission,
    }
}

interface Order {
    symbol: string,
    qty: string,
    side: "buy" | "sell",
    type: "market" | "limit" | "stop" | "stop_limit",
    time_in_force: "day",
    limit_price: string,
    stop_price: string,
}

export const createOrder = async (account_id: string, order: Order, opt?: Options) => {
    if (opt?.returnFake) return {
        status: 200,
        data: extractCreateOrder({
            "id": "5042d121-f9d3-4e64-a680-3e1faadc2114",
            "client_order_id": "05e41e5a-4f6f-42da-90e2-caedac12b926",
            "created_at": "2024-04-04T14:56:29.216131Z",
            "updated_at": "2024-04-04T14:56:29.276068Z",
            "submitted_at": "2024-04-04T14:56:29.224031Z",
            "filled_at": "2024-04-04T14:56:29.272053Z",
            "expired_at": null,
            "canceled_at": null,
            "failed_at": null,
            "replaced_at": null,
            "replaced_by": null,
            "replaces": null,
            "asset_id": "b0b6dd9d-8b9b-48a9-ba46-b9d54906e415",
            "symbol": "AAPL",
            "asset_class": "us_equity",
            "notional": null,
            "qty": "1",
            "filled_qty": "1",
            "filled_avg_price": "170.98",
            "order_class": "",
            "order_type": "market",
            "type": "market",
            "side": "buy",
            "time_in_force": "day",
            "limit_price": null,
            "stop_price": null,
            "status": "filled",
            "extended_hours": false,
            "legs": null,
            "trail_percent": null,
            "trail_price": null,
            "hwm": null,
            "commission": "0",
            "subtag": null,
            "source": "broker_dashboard",
            ...order
        })
    }

    if (order.type === "market" || order.type === "limit")
        delete order.stop_price

    if (order.type === "market" || order.type === "stop")
        delete order.limit_price

    const alpacaRes = await fetch(`${alpacaUrl}/trading/accounts/${account_id}/orders`, {
        method: "POST",
        headers: {
            accept: "application/json",
            'content-type': 'application/json',
            Authorization: "Basic " + Buffer.from(alpacaKey + ":" + alpacaSecret).toString("base64"),
        },
        body: JSON.stringify(order)
    })

    let alpacaData = await alpacaRes.json()
    if (alpacaRes.status === 200) alpacaData = extractCreateOrder(alpacaData)
    return { status: alpacaRes.status, data: alpacaData }
}