import express from "express";
import { createUser, getUser, updateUser, closeUser, reopenUser } from "../db/controllers/userController";
import { isUserLoggedIn } from "../middleware";
const userRoutes = express.Router()

userRoutes.post("/", createUser)
userRoutes.get("/:account_number", isUserLoggedIn, getUser)
userRoutes.put("/:account_number", isUserLoggedIn, updateUser)
userRoutes.post("/:account_number/close", isUserLoggedIn, closeUser)
userRoutes.post("/:account_number/reopen", isUserLoggedIn, reopenUser)

export default userRoutes
