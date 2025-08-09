import express from "express";
import { login, signup } from "../controller/auth";

const authRoute = express.Router();

authRoute.post("/login", login);
authRoute.post("/signup", signup);

export default authRoute;
