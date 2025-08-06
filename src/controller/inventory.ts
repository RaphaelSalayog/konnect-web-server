import { NextFunction, Request, Response } from "express";
import User from "../model/Inventory";

export const createInventory = async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.create({
        name: "raphael",
        email: "rsalayog@gmail.com",
        password: "password",
    });

    res.status(200).json({
        qwe: user,
        message: "success",
    });
};
