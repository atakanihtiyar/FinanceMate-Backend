import express from "express";
import passport from 'passport'
import { Request, Response } from "express";

const sessionRoutes = express.Router()

interface IRequestWithUser extends Request {
    user: {
        account_number: string,
        given_name: string,
        family_name: string
    }
}

sessionRoutes.get("/check", (req: IRequestWithUser, res: Response) => {
    if (req.user) {
        res.status(201).json({ result: true, user: { account_number: req.user.account_number, given_name: req.user.given_name, family_name: req.user.family_name } })
    }
    else {
        return res.status(401).json({ result: false, user: null })
    }
})

sessionRoutes.post("/logout", (req, res) => {
    req.logout(function (err) {
        if (err) { return res.json({ result: false, message: err.message }) }
        return res.status(201).json({ result: true, message: "successfully logout" })
    });
})

sessionRoutes.post("/login", (req, res) => {
    passport.authenticate('local', (err, user, info, status) => {
        if (err) return res.status(500).json({ result: false, user: null, message: info.message })
        if (!user) return res.status(401).json({ result: false, user: null, message: info.message })
        req.logIn(user, (err) => {
            if (err) return res.status(401).json({ result: false, user: null, message: info.message })
            return res.status(201).json({ result: true, user: { account_number: user.account_number, given_name: user.given_name, family_name: user.family_name } })
        })
    })(req, res)
})

export default sessionRoutes