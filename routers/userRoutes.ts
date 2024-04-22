import express from "express";
import { createUser, getUser, updateUser, deleteUser } from "../db/controllers/userController";
const userRoutes = express.Router()

userRoutes.post("/", createUser)
userRoutes.get("/:account_number", getUser)
userRoutes.put("/:account_number", updateUser)
userRoutes.delete("/:account_number", deleteUser)

export default userRoutes