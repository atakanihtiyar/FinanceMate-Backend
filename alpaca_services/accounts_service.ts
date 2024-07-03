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

interface Options {
    returnFake?: boolean
}

const extractAlpacaUser = (alpacaUser) => {
    const user: any = {
        status: alpacaUser.status,
        alpaca_id: alpacaUser.id,
        account_number: alpacaUser.account_number,
        given_name: alpacaUser.identity.given_name,
        family_name: alpacaUser.identity.family_name,
        email_address: alpacaUser.contact.email_address,
        tax_id: alpacaUser.identity.tax_id,
        tax_id_type: alpacaUser.identity.tax_id_type,
        country_of_tax_residence: alpacaUser.identity.country_of_tax_residence,
        phone_number: alpacaUser.contact.phone_number
    }
    delete alpacaUser.status
    delete alpacaUser.id
    delete alpacaUser.account_number
    delete alpacaUser.identity.given_name
    delete alpacaUser.identity.family_name
    delete alpacaUser.contact.email_address
    delete alpacaUser.identity.tax_id
    delete alpacaUser.identity.tax_id_type
    delete alpacaUser.identity.country_of_tax_residence
    delete alpacaUser.contact.phone_number
    user.alpaca = {
        ...alpacaUser
    }

    return user
}

export const createAlpacaUser = async (userData: UserData, opt?: Options) => {
    if (opt?.returnFake) return {
        status: 200,
        data: extractAlpacaUser({
            "id": userData.identity.tax_id,
            "account_number": userData.identity.tax_id,
            "account_type": "trading",
            "status": "ACTIVE",
            "crypto_status": "ACTIVE",
            "currency": "USD",
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
                ...(userData && userData.contact)
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
                ...(userData && userData.identity)
            },
            "disclosures": {
                "is_control_person": false,
                "is_affiliated_exchange_or_finra": false,
                "is_politically_exposed": false,
                "immediate_family_exposed": false,
                ...(userData && userData.disclosures)
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
                    ...(userData && userData.agreements && userData.agreements)
                }
            ],
            "trusted_contact": {
                "given_name": "Jane",
                "family_name": "Doe",
                "email_address": "jane.doe@example.com"
            }
        })
    }

    const alpacaRes = await fetch(`${alpacaUrl}/accounts`, {
        method: "POST",
        headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Basic " + Buffer.from(alpacaKey + ":" + alpacaSecret).toString("base64")
        },
        body: JSON.stringify(userData)
    })
    let alpacaData = await alpacaRes.json()
    if (alpacaRes.status === 200) alpacaData = extractAlpacaUser(alpacaData)
    return { status: alpacaRes.status, data: alpacaData }
}

export const updateAlpacaUser = async (userData: UserData, userOnDb, opt?: Options) => {
    if (opt?.returnFake) return {
        status: 200,
        data: extractAlpacaUser({
            "id": userOnDb.alpaca_id,
            "account_number": userOnDb.account_number,
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
                ...(userData && userData.contact)
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
                ...(userData && userData.identity)
            },
            "disclosures": {
                "is_control_person": false,
                "is_affiliated_exchange_or_finra": false,
                "is_politically_exposed": false,
                "immediate_family_exposed": false,
                ...(userData && userData.disclosures)
            },
            "agreements": userData && userData.agreements ? [...userData.agreements] : [
                {
                    "agreement": "account_agreement",
                    "signed_at": "2019-09-11T18:09:33Z",
                    "ip_address": "185.13.21.99"
                },
                {
                    "agreement": "customer_agreement",
                    "signed_at": "2019-09-11T18:09:33Z",
                    "ip_address": "185.13.21.99"
                },
                {
                    "agreement": "margin_agreement",
                    "signed_at": "2019-09-11T18:09:33Z",
                    "ip_address": "185.13.21.99"
                },

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
        })
    }

    const alpacaRes = await fetch(`${alpacaUrl}/accounts/${userOnDb.alpaca_id}`, {
        method: "PATCH",
        headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Basic " + Buffer.from(alpacaKey + ":" + alpacaSecret).toString("base64")
        },
        body: JSON.stringify(userData)
    })
    let alpacaData = await alpacaRes.json()
    if (alpacaRes.status === 200) alpacaData = extractAlpacaUser(alpacaData)
    return { status: alpacaRes.status, data: alpacaData }
}

export const closeAlpacaUser = async (account_id: string, opt?: Options) => {
    if (opt?.returnFake) return true

    const alpacaRes = await fetch(`${alpacaUrl}/accounts/${account_id}/actions/close`, {
        method: "POST",
        headers: {
            Authorization: "Basic " + Buffer.from(alpacaKey + ":" + alpacaSecret).toString("base64")
        }
    })
    if (alpacaRes.status === 204) return true
    else return false
}

export const reopenAlpacaUser = async (account_id: string, opt?: Options) => {
    if (opt?.returnFake) return true

    const alpacaRes = await fetch(`${alpacaUrl}/accounts/${account_id}/actions/reopen`, {
        method: "POST",
        headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Basic " + Buffer.from(alpacaKey + ":" + alpacaSecret).toString("base64")
        }
    })
    if (alpacaRes.status === 200) return true
    else return false
}

interface AchData {
    account_owner_name: string,
    bank_account_type: "CHECKING" | "SAVINGS",
    bank_account_number: string,
    bank_routing_number: string,
    nickname?: string,
}


const extractAchRelationship = (relation) => {
    return {
        relation_id: relation.id,
        created_at: relation.created_at,
        updated_at: relation.updated_at,
        status: relation.status,
        account_owner_name: relation.account_owner_name,
        bank_account_type: relation.bank_account_type,
        bank_account_number: relation.bank_account_number,
        bank_routing_number: relation.bank_routing_number,
        nickname: relation.nickname,
    }
}

const extractAchRelationships = (relationships) => {
    return relationships.map((relation) => {
        return extractAchRelationship(relation)
    })
}

export const getAchRelationships = async (account_id: string, opt?: Options) => {
    if (opt?.returnFake) {
        return {
            status: 200,
            data: [
                {
                    "id": "61e69015-8549-4bfd-b9c3-01e75843f47d",
                    "created_at": "2021-03-16T18:38:01.942282Z",
                    "updated_at": "2021-03-16T18:38:01.942282Z",
                    "account_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                    "status": "QUEUED",
                    "account_owner_name": "string",
                    "bank_account_type": "CHECKING",
                    "bank_account_number": "string",
                    "bank_routing_number": "string",
                    "nickname": "string"
                }
            ]
        }
    }

    const alpacaRes = await fetch(`${alpacaUrl}/accounts/${account_id}/ach_relationships`, {
        method: "GET",
        headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Basic " + Buffer.from(alpacaKey + ":" + alpacaSecret).toString("base64")
        }
    })
    let alpacaData = await alpacaRes.json()
    if (alpacaRes.status === 200) return { status: 200, data: extractAchRelationships(alpacaData) }
    else return alpacaData
}

export const createAchRelationship = async (account_id: string, achData: AchData, opt?: Options) => {
    if (opt?.returnFake) {
        return {
            status: 200,
            data: {
                "id": "61e69015-8549-4bfd-b9c3-01e75843f47d",
                "created_at": "2021-03-16T18:38:01.942282Z",
                "updated_at": "2021-03-16T18:38:01.942282Z",
                "account_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                "status": "QUEUED",
                "account_owner_name": "string",
                "bank_account_type": "CHECKING",
                "bank_account_number": "string",
                "bank_routing_number": "string",
                "nickname": "string",
                ...achData
            }
        }
    }

    const alpacaRes = await fetch(`${alpacaUrl}/accounts/${account_id}/ach_relationships`, {
        method: "POST",
        headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Basic " + Buffer.from(alpacaKey + ":" + alpacaSecret).toString("base64")
        },
        body: JSON.stringify(achData)
    })
    let alpacaData = await alpacaRes.json()
    if (alpacaRes.status === 200) return { status: 200, data: extractAchRelationship(alpacaData) }
    else return alpacaData
}

export const deleteAchRelationship = async (account_id: string, ach_relationship_id: string, opt?: Options) => {
    if (opt?.returnFake) {
        return {
            status: 204
        }
    }
    console.log(ach_relationship_id)

    const alpacaRes = await fetch(`${alpacaUrl}/accounts/${account_id}/ach_relationships/${ach_relationship_id}`, {
        method: "DELETE",
        headers: {
            Authorization: "Basic " + Buffer.from(alpacaKey + ":" + alpacaSecret).toString("base64")
        },
    })

    return { status: 204 }
}