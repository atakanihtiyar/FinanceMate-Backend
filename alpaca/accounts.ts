const alpacaUrl = process.env.ALPACA_API_URL || "alpaca_api_url_not_found"
const alpacaKey = process.env.ALPACA_API_KEY || "alpaca_api_key_not_found"
const alpacaSecret = process.env.ALPACA_API_SECRET || "alpaca_api_secret_not_found"


interface UserData {
    identity: {
        given_name: string,
        family_name: string,
        date_of_birth: string,
        country_of_tax_residence: string,
        tax_id_type: string,
        tax_id: string,
        funding_source: string[]
    },
    contact: {
        email_address: string,
        phone_number: string,
        street_address: string[],
        unit: string,
        city: string,
        state: string,
        postal_code: string
    },
    disclosures: {
        is_control_person: boolean,
        is_affiliated_exchange_or_finra: boolean,
        is_politically_exposed: boolean,
        immediate_family_exposed: boolean
    },
    agreements?: {
        agreement: "account_agreement" | "customer_agreement" | "margin_agreement",
        signed_at: string,
        id_address: string
    }[]
}

export const createAlpacaUser = async (userData) => {
    const alpacaRes = await fetch(`${alpacaUrl}/accounts`, {
        method: "POST",
        headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Basic " + Buffer.from(alpacaKey + ":" + alpacaSecret).toString("base64")
        },
        body: JSON.stringify(userData)
    })
    const alpacaData = await alpacaRes.json()
    return { status: alpacaRes.status, data: alpacaData }
}

export const createFakeAlpacaUser = async (userData) => {
    return {
        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "account_number": "string",
        "account_type": "trading",
        "status": "ACTIVE",
        "crypto_status": "ACTIVE",
        "currency": "string",
        "created_at": "2024-05-07T08:07:14.464Z",
        "last_equity": "string",
        "enabled_assets": [
            "us_equity"
        ],
        "contact": {
            "email_address": "john.doe@example.com",
            "phone_number": "+15556667788",
            "street_address": [
                "20 N San Mateo Dr"
            ],
            "unit": "string",
            "city": "San Mateo",
            "state": "CA",
            "postal_code": "94401",
            ...userData.contact
        },
        "identity": {
            "given_name": "John",
            "family_name": "Doe",
            "date_of_birth": "1990-01-01",
            "tax_id": "666-55-4321",
            "tax_id_type": "USA_SSN",
            "country_of_citizenship": "AUS",
            "country_of_birth": "AUS",
            "country_of_tax_residence": "USA",
            "funding_source": [
                "employment_income"
            ],
            ...userData.identity
        },
        "disclosures": {
            "is_control_person": false,
            "is_affiliated_exchange_or_finra": false,
            "is_politically_exposed": false,
            "immediate_family_exposed": false,
            ...userData.disclosures
        },
        "documents": [
            [
                {
                    "document_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                    "document_type": "identity_verification",
                    "created_at": "2024-05-07T08:07:14.464Z",
                    "mime_type": "string",
                    "content": "string",
                    "document_sub_type": "string"
                }
            ]
        ],
        "agreements": [
            {
                "agreement": "customer_agreement",
                "signed_at": "2019-09-11T18:09:33Z",
                "ip_address": "185.13.21.99",
                "revision": "string",
                ...userData.agreement
            }
        ],
        "trusted_contact": {
            "given_name": "Jane",
            "family_name": "Doe",
            "email_address": "jane.doe@example.com"
        }
    }
}

export const updateAlpacaUser = async (userData, account_id) => {
    const alpacaRes = await fetch(`${alpacaUrl}/accounts/${account_id}`, {
        method: "PATCH",
        headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Basic " + Buffer.from(alpacaKey + ":" + alpacaSecret).toString("base64")
        },
        body: JSON.stringify(userData)
    })
    const alpacaData = await alpacaRes.json()
    return { status: alpacaRes.status, data: alpacaData }
}

export const updateFakeAlpacaUser = async (userData: UserData) => {
    return {
        status: 200, data: {
            "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
            "account_number": "string",
            "status": "ACTIVE",
            "crypto_status": "ACTIVE",
            "kyc_result": {
                "reject": "string",
                "accept": "string",
                "indeterminate": "string",
                "addidional_information": "string",
                "summary": "string"
            },
            "currency": "string",
            "last_equity": "string",
            "created_at": "2024-05-07T08:07:14.464Z",
            "contact": {
                "email_address": "john.doe@example.com",
                "phone_number": "+15556667788",
                "street_address": [
                    "20 N San Mateo Dr"
                ],
                "unit": "string",
                "city": "San Mateo",
                "state": "CA",
                "postal_code": "94401",
                ...userData.contact
            },
            "identity": {
                "given_name": "John",
                "family_name": "Doe",
                "date_of_birth": "1990-01-01",
                "tax_id": "666-55-4321",
                "tax_id_type": "USA_SSN",
                "country_of_citizenship": "AUS",
                "country_of_birth": "AUS",
                "country_of_tax_residence": "USA",
                "funding_source": [
                    "employment_income"
                ],
                ...userData.identity
            },
            "disclosures": {
                "is_control_person": false,
                "is_affiliated_exchange_or_finra": false,
                "is_politically_exposed": false,
                "immediate_family_exposed": false,
                ...userData.disclosures
            },
            "agreements": [
                {
                    "agreement": "customer_agreement",
                    "signed_at": "2019-09-11T18:09:33Z",
                    "ip_address": "185.13.21.99",
                    "revision": "string"
                }
            ],
            "documents": [
                {
                    "id": "0d18ae51-3c94-4511-b209-101e1666416b",
                    "document_type": "identity_verification",
                    "document_sub_type": "passport",
                    "mime_type": "image/jpeg",
                    "created_at": "2019-09-30T23:55:31.185998Z"
                }
            ],
            "trusted_contact": {
                "given_name": "Jane",
                "family_name": "Doe",
                "email_address": "jane.doe@example.com"
            },
            "account_name": "string",
            "account_type": "trading",
            "custodial_account_type": "string",
            "minor_identity": {
                "given_name": "string",
                "family_name": "string",
                "date_of_birth": "2024-05-07",
                "tax_id": "string",
                "tax_id_type": "USA_SSN",
                "country_of_citizenship": "string",
                "country_of_birth": "string",
                "country_of_tax_residence": "string",
                "state": "string",
                "email": "user@example.com"
            },
            "trading_configurations": {
                "dtbp_check": "both",
                "trade_confirm_email": "all",
                "suspend_trade": true,
                "no_shorting": true,
                "fractional_trading": true,
                "max_margin_multiplier": "string",
                "max_options_trading_level": 0,
                "pdt_check": "entry",
                "ptp_no_exception_entry": "string"
            },
            "usd": {
                "buying_power": "string",
                "regt_buying_power": "string",
                "daytrading_buying_power": "string",
                "options_buying_power": "string",
                "cash": "string",
                "cash_withdrawable": "string",
                "cash_transferable": "string",
                "pending_transfer_out": "string",
                "portfolio_value": "string",
                "equity": "string",
                "long_market_value": "string",
                "short_market_value": "string",
                "initial_margin": "string",
                "maintenance_margin": "string",
                "last_maintenance_margin": "string",
                "sma": "string",
                "last_equity": "string",
                "last_long_market_value": "string",
                "last_short_market_value": "string",
                "last_cash": "string",
                "last_buying_power": "string",
                "last_regt_buying_power": "string",
                "last_daytrading_buying_power": "string",
                "last_options_buying_power": "string"
            },
            "enabled_assets": [
                "us_equity"
            ]
        }
    }
}

export const closeAlpacaUser = async (account_id: string) => {
    const alpacaRes = await fetch(`${alpacaUrl}/accounts/${account_id}/actions/close`, {
        method: "POST",
        headers: {
            Authorization: "Basic " + Buffer.from(alpacaKey + ":" + alpacaSecret).toString("base64")
        }
    })
    if (alpacaRes.status === 200) return true
    else return false
}

export const closeFakeAlpacaUser = async () => {
    return true
}

export const reopenAlpacaUser = async (account_id: string) => {
    const alpacaRes = await fetch(`${alpacaUrl}/accounts/${account_id}/actions/reopen`, {
        method: "POST",
        headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Basic " + Buffer.from(alpacaKey + ":" + alpacaSecret).toString("base64")
        }
    })
    const alpacaData = await alpacaRes.json()
    console.log(alpacaRes.status)
    console.dir(alpacaData)
    if (alpacaRes.status === 200) return true
    else return false
}

export const reopenFakeAlpacaUser = async () => {
    return true
}