import { NextFunction, Request, Response } from "express";
const jwt = require("jsonwebtoken");

const isAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return next({
                statusCode: 401,
                message: "Not authenticated",
            });
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET_TOKEN);
        if (!decodedToken) {
            return next({
                statusCode: 401,
                message: "Not authenticated",
            });
        }

        req.user = decodedToken;
        next();
    } catch (error: any) {
        next({
            statusCode: 401,
            message: "Invalid or expired token!",
        });
    }
};

export default isAuth;
