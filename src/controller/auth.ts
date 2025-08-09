import { NextFunction, Request, Response } from "express";
import User from "../model/user";
import bcrypt from "bcrypt";

const jwt = require("jsonwebtoken");

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body.payload;

        const user: any = await User.findOne({
            where: {
                email,
            },
        });

        if (!user) {
            return next({
                statusCode: 404,
                message: "Email does not exist!",
            });
        }

        const isEqual = await bcrypt.compare(password, user.password_hash);
        if (!isEqual) {
            return next({
                statusCode: 401,
                message: "Invalid credentials!",
            });
        }

        const token = jwt.sign(
            {
                email: user.email,
                first_name: user.firstName,
                last_name: user.lastName,
            },
            process.env.JWT_SECRET_TOKEN
        );

        delete user.password;
        res.status(200).json({
            token,
            user,
        });
    } catch (error: any) {
        next({
            statusCode: 400,
            message: "Failed to login. Please try again later.",
        });
    }
};

export const signup = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const payload = req.body.payload;
        const { password, ...restData } = payload;

        const isEmailExist = await User.findOne({
            where: {
                email: payload.email,
            },
        });

        if (isEmailExist) {
            return next({
                statusCode: 409,
                message: "Email already exists!",
            });
        }

        const hashedPw = await bcrypt.hash(password, 10);

        const resp = await User.create({
            ...restData,
            password_hash: hashedPw,
            auth_provider: "local",
        });
        delete (resp as any).password_hash;

        res.json({ data: resp });
    } catch (error: any) {
        next({
            statusCode: 400,
            message: "Failed to create account. Please try again later.",
        });
    }
};
