import { Request, Response, NextFunction } from "express";
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

        next();
    } catch (error: any) {
        next({
            statusCode: 500,
            message: "Something went wrong!",
        });
    }
};

export default isAuth;
