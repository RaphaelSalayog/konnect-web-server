import { NextFunction, Request, Response } from "express";
import Inventory from "../model/Inventory";

export const getAllInventory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const resp = await Inventory.findAll({
            where: {
                isDeleted: 0,
            },
            attributes: { exclude: ["isDeleted"] },
        });

        res.status(200).json({ data: resp });
    } catch (error: any) {
        next({
            statusCode: 400,
            message: "Failed to get all inventory. Please try again later.",
        });
    }
};

export const getInventoryById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.body;
        const resp = await Inventory.findOne({
            where: {
                id: id,
                isDeleted: 0,
            },
            attributes: { exclude: ["isDeleted"] },
        });

        res.status(200).json({ data: resp });
    } catch (error: any) {
        next({
            statusCode: 400,
            message: "Failed to get inventory by id. Please try again later.",
        });
    }
};

export const createInventory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const resp = await Inventory.create(req.body);
        const plainResp = resp.get({ plain: true });
        delete plainResp.isDeleted;

        res.status(201).json({ data: plainResp });
    } catch (error: any) {
        next({
            statusCode: 400,
            message: "Failed to create inventory. Please try again later.",
        });
    }
};

export const updateInventory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id, ...restData } = req.body;
        const resp = await Inventory.update(restData, {
            where: { id },
        });

        res.status(200).json({ data: resp });
    } catch (error: any) {
        next({
            statusCode: 400,
            message: "Failed to update inventory. Please try again later.",
        });
    }
};

export const deleteInventory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.body;
        const resp = await Inventory.update(
            { isDeleted: 1 },
            {
                where: { id },
            }
        );

        res.status(200).json({ data: resp });
    } catch (error: any) {
        next({
            statusCode: 400,
            message: "Failed to delete inventory. Please try again later.",
        });
    }
};
