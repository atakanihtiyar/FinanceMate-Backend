import { Schema, model } from "mongoose"
import passportLocalMongoose from "passport-local-mongoose"

const userSchema = new Schema({
    is_admin: {
        type: Boolean,
        required: true,
        default: false
    },
    is_active: {
        type: Boolean,
        required: true,
        default: true
    },
    account_number: {
        type: String,
        required: true,
        unique: true
    },
    given_name: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 20,
        match: /^[ -~]+$/
    },
    family_name: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 20,
        match: /^[ -~]+$/
    },
    tax_id: {
        type: String,
        required: true,
        validate: [
            {
                validator: function (value) {
                    if (this.tax_id_type === "USA_SSN") {
                        return value.length === 11
                    } else if (this.tax_id_type === "OTHER_GOV_ID") {
                        return 2 <= value.length && value.length <= 40
                    }
                },
                message: "Invalid tax id length"
            },
            {
                validator: function (value) {
                    if (this.tax_id_type === "USA_SSN") {
                        const regex = /(?!(^(000|666)-|.*-00-.*|-0000$)|^(0{3}-0{2}-0{4}|1{3}-1{2}-1{4}|2{3}-2{2}-2{4}|3{3}-3{2}-3{4}|4{3}-4{2}-4{4}|5{3}-5{2}-5{4}|6{3}-6{2}-6{4}|7{3}-7{2}-7{4}|8{3}-8{2}-8{4}|9{3}-9{2}-9{4}|123-45-6789|987-65-4321)$)^\d{3}-\d{2}-\d{4}$/
                        return regex.test(value)
                    } else if (this.tax_id_type === "OTHER_GOV_ID") {
                        const regex = /(?!^(0{3}-0{2}-0{4}|1{3}-1{2}-1{4}|2{3}-2{2}-2{4}|3{3}-3{2}-3{4}|4{3}-4{2}-4{4}|5{3}-5{2}-5{4}|6{3}-6{2}-6{4}|7{3}-7{2}-7{4}|8{3}-8{2}-8{4}|9{3}-9{2}-9{4}|123-45-6789|987-65-4321)$)^([a-zA-Z0-9\+-\.])+$/
                        return regex.test(value)
                    }
                },
                message: "Invalid tax id format"
            },
            {
                validator: function (value) {
                    let letters: RegExpMatchArray | string = value.match(/[a-zA-Z\.\+-]/g) ?? ""
                    let numbers: RegExpMatchArray | string = value.match(/[0-9]/g) ?? ""
                    if (numbers.length <= letters.length) return false
                    return true
                },
                message: "Invalid tax id"
            }
        ]
    },
    tax_id_type: {
        type: String,
        enum: ["USA_SSN", "OTHER_GOV_ID"],
        required: true
    },
    country_of_tax_residence: {
        type: String,
        enum: ["USA", "TUR"],
        required: true
    },
    phone_number: {
        type: String,
        required: true,
        match: /^\+[0-9]{1,3}[0-9]{10}$/
    },
    email_address: {
        type: String,
        required: true,
        match: /^[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+$/,
        unique: true
    },
    ip_address: {
        type: String,
        require: true
    },
    alpaca: {
        alpaca_id: {
            type: String,
            require: true
        },
        account_number: {
            type: String || null,
            require: true
        },
        account_type: {
            type: String,
            enum: ["trading", "custodial", "donor_advised"],
            require: false
        },
        status: {
            type: String,
            enum: ["INACTIVE", "ONBOARDING", "SUBMITTED", "SUBMISSION_FAILED",
                "ACTION_REQUIRED", "ACCOUNT_UPDATED", "APPROVAL_PENDING",
                "APPROVED", "REJECTED", "ACTIVE", "ACCOUNT_CLOSED"],
            require: true
        },
        crypto_status: {
            type: String,
            enum: ["INACTIVE", "ONBOARDING", "SUBMITTED", "SUBMISSION_FAILED",
                "ACTION_REQUIRED", "ACCOUNT_UPDATED", "APPROVAL_PENDING",
                "APPROVED", "REJECTED", "ACTIVE", "ACCOUNT_CLOSED"],
            require: false
        },
        currency: {
            type: String,
            enum: [
                "USD", // US Dollar
                "JPY", // Japanese Yen
                "EUR", // Euro
                "CAD", // Canadian Dollar
                "GBP", // British Pound Sterling
                "CHF", // Swiss Franc
                "TRY", // Turkish Lira
                "AUD", // Australian Dollar
                "CZK", // Czech Koruna
                "SEK", // Swedish Krona
                "DKK", // Danish Krone
                "SGD", // Singapore Dollar
                "HKD", // Hong Kong Dollar
                "HUF", // Hungarian Forint
                "NZD", // New Zealand Dollar
                "NOK", // Norwegian Krone
                "PLN"  // Poland Złoty
            ],
            require: true
        },
        created_at: {
            type: Date,
            require: true
        },
        last_equity: {
            type: String,
            require: true
        },
        enabled_assets: {
            type: [String],
            require: false
        },
        contact: {
            email_address: {
                type: String,
                require: true,
                match: /^[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+$/
            },
            phone_number: {
                type: String,
                require: true,
                match: /^\+[0-9]{1,3}[0-9]{11}$/
            },
            street_address: {
                type: [String],
                require: true,
                validate: [
                    {
                        validator: function (value) {
                            if (value && value[0]) {
                                1 <= value[0].length && value[0].length <= 60
                            }
                        },
                        message: "Invalid street address length"
                    }
                ]
            },
            state: {
                type: String,
                validate: [
                    {
                        validator: function (value) {
                            if (this.country_of_tax_residence === "USA") {
                                const state = [
                                    ["AA", "Armed Forces of the Americas"],
                                    ["AE", "Armed Forces of Europe"],
                                    ["AK", "Alaska"],
                                    ["AL", "Alabama"],
                                    ["AP", "Armed Forces of the Pacific"],
                                    ["AR", "Arkansas"],
                                    ["AZ", "Arizona"],
                                    ["CA", "California"],
                                    ["CO", "Colorado"],
                                    ["CT", "Connecticut"],
                                    ["DC", "District of Columbia"],
                                    ["DE", "Delaware"],
                                    ["FL", "Florida"],
                                    ["GA", "Georgia"],
                                    ["HI", "Hawaii"],
                                    ["IA", "Iowa"],
                                    ["ID", "Idaho"],
                                    ["IL", "Illinois"],
                                    ["IN", "Indiana"],
                                    ["KS", "Kansas"],
                                    ["KY", "Kentucky"],
                                    ["LA", "Louisiana"],
                                    ["MA", "Massachusetts"],
                                    ["MD", "Maryland"],
                                    ["ME", "Maine"],
                                    ["MI", "Michigan"],
                                    ["MN", "Minnesota"],
                                    ["MO", "Missouri"],
                                    ["MS", "Mississippi"],
                                    ["MT", "Montana"],
                                    ["NC", "North Carolina"],
                                    ["ND", "North Dakota"],
                                    ["NE", "Nebraska"],
                                    ["NH", "New Hampshire"],
                                    ["NJ", "New Jersey"],
                                    ["NM", "New Mexico"],
                                    ["NV", "Nevada"],
                                    ["NY", "New York"],
                                    ["OH", "Ohio"],
                                    ["OK", "Oklahoma"],
                                    ["OR", "Oregon"],
                                    ["PA", "Pennsylvania"],
                                    ["RI", "Rhode Island"],
                                    ["SC", "South Carolina"],
                                    ["SD", "South Dakota"],
                                    ["TN", "Tennessee"],
                                    ["TX", "Texas"],
                                    ["UT", "Utah"],
                                    ["VA", "Virginia"],
                                    ["VT", "Vermont"],
                                    ["WA", "Washington"],
                                    ["WI", "Wisconsin"],
                                    ["WV", "West Virginia"],
                                    ["WY", "Wyoming"]
                                ]
                                return state.filter(item => item[0] === value).length > 0
                            } else if (this.country_of_tax_residence === "TUR") {
                                const regex = /^(?!^\d+$)^[a-zA-Z0-9_ ]*$/
                                return regex.test(value)
                            }
                        },
                        message: "Invalid state format"
                    },
                    {
                        validator: function (value) {
                            if (this.country_of_tax_residence === "USA") {
                                return value.length === 2
                            } else if (this.country_of_tax_residence === "TUR") {
                                if (0 <= value.length && value.length <= 50)
                                    return true
                            }
                        },
                        message: "Invalid state length"
                    }
                ]
            },
            unit: {
                type: String,
                require: false,
                minLength: 1,
                maxLength: 10,
                match: /^[ -~]*$/
            },
            city: {
                type: String,
                require: false,
                minLength: 1,
                maxLength: 50,
                match: /^(?!^\d+$)^[a-zA-Z0-9_ ]+$/
            },
            postal_code: {
                type: String,
                require: false,
                minLength: 5,
                kMaxLength: 10,
                match: /^[0-9]{5}[ -~]{0,5}$/
            },
        },
        identity: {
            given_name: {
                type: String,
                required: true,
                minLength: 3,
                maxLength: 20
            },
            family_name: {
                type: String,
                required: true,
                minLength: 3,
                maxLength: 20
            },
            date_of_birth: {
                type: String,
                required: true,
                match: /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/
            },
            tax_id: {
                type: String,
                required: false
            },
            tax_id_type: {
                type: String,
                enum: ["USA_SSN", "OTHER_GOV_ID"],
                required: true
            },
            country_of_tax_residence: {
                type: String,
                enum: ["USA", "TUR"],
                required: true
            },
            funding_source: {
                type: [String],
                enum: ["employment_income", "investments", "inheritance", "business_income", "savings", "family"],
                required: true
            }
        },
        disclosures: {
            is_control_person: {
                type: Boolean,
                required: true
            },
            is_affiliated_exchange_or_finra: {
                type: Boolean,
                required: true
            },
            is_politically_exposed: {
                type: Boolean,
                required: true
            },
            immediate_family_exposed: {
                type: Boolean,
                required: true
            },
        },
        agreements: {
            type: [{
                agreement: {
                    type: String,
                    enum: ["account_agreement", "customer_agreement", "margin_agreement"],
                    required: true
                },
                signed_at: {
                    type: Date,
                    required: true
                },
                ip_address: {
                    type: String,
                    required: true
                },
            }],
            required: true
        }
    },
}, { timestamps: true })

userSchema.plugin(passportLocalMongoose, { usernameField: "email_address" })
const User = model("User", userSchema)

export default User

