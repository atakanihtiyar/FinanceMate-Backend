import User from "../models/User";

export async function createUser(user, password) {
    const registeredUser = await User.register(user, password)
    if (!registeredUser) return false
    return registeredUser
}

export async function getUser(account_number, selects = "") {
    const foundUser = await User.findOne({ account_number: account_number }, selects)
    if (!foundUser) return false
    return foundUser
}

export async function updateUser(user) {
    const updatedUser = await User.findOneAndUpdate({ account_number: user.account_number }, user)
    if (!updatedUser) return false
    return updatedUser
}

export async function closeUser(account_number) {
    const closedUser = await User.findOneAndUpdate({ account_number: account_number }, { status: "ACCOUNT_CLOSED" })
    if (!closedUser) return false
    return closedUser
}

export async function reopenUser(account_number) {
    const closedUser = await User.findOneAndUpdate({ account_number: account_number }, { status: "ACTIVE" })
    if (!closedUser) return false
    return closedUser
}