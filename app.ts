import express from 'express'
import cors from 'cors'
import { connectToAtlas } from './db/connection'
import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import User from './db/models/User'
import cookieParser from 'cookie-parser'
import session, { SessionOptions } from 'express-session'

import userRoutes from './routers/userRoutes'
import sessionRoutes from './routers/sessionRoutes'
import tradingRoutes from './routers/tradingRoutes'
import assetRoutes from './routers/assetRoutes'
import dataRoutes from './routers/dataRoutes'

connectToAtlas()

// #region EXPRESS MIDDLEWARES

const app = express()
const PORT = process.env.PORT || 5050
const sessionSecret = process.env.SESSION_SECRET || "itookmypills"
const allowedOrigin = process.env.CLIENT_ON === "local" ? process.env.CLIENT_LOCAL_URL : process.env.CLIENT_REMOTE_URL

app.use(cors({ origin: allowedOrigin, credentials: true }))
app.use(express.json())

const sessionOptions: SessionOptions = {
	secret: sessionSecret,
	resave: false,
	saveUninitialized: true,
	cookie: {
		httpOnly: true,
		sameSite: "none",
		expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
	}
}
app.use(session(sessionOptions))
app.use(cookieParser())

// #endregion

// #region PASSPORT MIDDLEWARES

app.use(passport.initialize())
app.use(passport.session())
passport.use(User.createStrategy())

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

// #endregion

// #region APP

try {
	app.use("/users", userRoutes)
	app.use("/session", sessionRoutes)
	app.use("/trading", tradingRoutes)
	app.use("/assets", assetRoutes)
	app.use("/data", dataRoutes)

	app.listen(PORT, () => {
		return console.log(`Server listening at http://localhost:${PORT}`)
	})
}
catch (err) {
	console.log(err)
}

// #endregion