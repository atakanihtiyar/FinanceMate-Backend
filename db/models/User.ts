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
        trim: true,
        minLength: 3,
        maxLength: 20
    },
    family_name: {
        type: String,
        required: true,
        trim: true,
        minLength: 3,
        maxLength: 20
    },
    phone_number: {
        type: String,
        required: true,
        unique: true,
        match: /^\+[0-9]{1,3}[0-9]{11}$/
    },
    email_address: {
        type: String,
        required: true,
        match: /^[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+$/,
        unique: true
    },
    created_at: {
        type: Date,
        required: true
    },
    updated_at: {
        type: Date,
        required: true
    },
    ip_address: {
        type: String,
        require: true
    }
})

userSchema.plugin(passportLocalMongoose, { usernameField: "email_address" })
const User = model("User", userSchema)
export default User