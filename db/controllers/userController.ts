import User from "../models/User";
import { Request, Response } from "express";

export async function createUser(req: Request, res: Response) {
    const { account_number, given_name, family_name, phone_number, email_address, password } = req.body
    const ip_address = req.socket.remoteAddress
    let created_at, updated_at
    created_at = updated_at = new Date()

    try {
        const user = new User({
            account_number,
            given_name,
            family_name,
            email_address,
            phone_number,
            password,
            created_at,
            updated_at,
            ip_address
        })
        const savedUser = await user.save()
        res.status(200).json(savedUser)
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ error: "An error occurred while creating the user" })
    }
}

export async function getUser(req: Request, res: Response) {
    const account_number = req.params.account_number

    try {
        const user = await User.findOne({ account_number })
        if (!user) return res.status(404).json({ error: "User not found" })
        res.send(user)
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ error: "An error occurred while fetching the user" })
    }
}

export async function updateUser(req: Request, res: Response) {
    const account_number = req.params.account_number
    const { given_name, family_name, phone_number, email_address, password } = req.body
    let updated_at = new Date()

    try {
        const updatedUser = await User.findOneAndUpdate({ account_number }, {
            given_name,
            family_name,
            email_address,
            phone_number,
            updated_at,
            password
        }, { new: true, runValidators: true })
        if (!updatedUser) res.status(404).json({ error: "User not found" })
        res.send(updatedUser)
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ error: "An error occurred while updating the user" })
    }
}

export async function deleteUser(req: Request, res: Response) {
    const account_number = req.params.account_number

    try {
        const deletedUser = await User.deleteOne({ account_number })
        if (!deletedUser) return res.status(404).json({ error: "User not found" })
        res.json(deletedUser)
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ error: "An error occurred while deleting the user" })
    }
}