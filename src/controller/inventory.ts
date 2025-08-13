import { NextFunction, Request, Response } from "express";
import { col, fn, Op, where } from "sequelize";
import Inventory from "../model/inventory";
import { handleAttachments } from "../utils/handleAttachments";
import { handleRequest } from "../utils/handleRequest";
import { stripKeys } from "../utils/stripKeys";

export const getAllInventory = async (req: Request, res: Response, next: NextFunction) => {
    const {
        search,
        filters,
        pagination: { offset, limit },
    } = handleRequest({ body: req.body });

    const whereCondition: any = {};

    if (search) {
        whereCondition.name = where(fn("LOWER", col("name")), {
            [Op.like]: `%${search.toLowerCase()}%`,
        });
    }

    try {
        const resp = await Inventory.findAndCountAll({
            where: whereCondition,
            attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
            limit: limit,
            offset: offset,
            order: [["updatedAt", "DESC"]],
        });

        res.status(200).json({ lists: resp.rows, total: resp.count });
    } catch (error: any) {
        next({
            statusCode: 400,
            message: "Failed to get all inventory. Please try again later.",
        });
    }
};

export const getInventoryById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.body.payload;
        const resp = await Inventory.findOne({
            where: {
                id: id,
                isDeleted: 0,
            },
            attributes: { exclude: ["isDeleted"] },
        });

        res.status(200).json(resp);
    } catch (error: any) {
        next({
            statusCode: 400,
            message: "Failed to get inventory by id. Please try again later.",
        });
    }
};

export const createInventory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { attachments, ...restDataPayload } = req.body;

        const respInventory = await Inventory.create(restDataPayload);
        const respInventoryData = stripKeys(respInventory, ["createdAt", "updatedAt", "deletedAt"]);

        const respAttachments = await handleAttachments(
            attachments,
            "inventory",
            respInventoryData.id
        );
        const respAttachmentsData = respAttachments.map((attachment) =>
            stripKeys(attachment, [
                "createdAt",
                "updatedAt",
                "deletedAt",
                "inventory_id",
                "user_id",
            ])
        );

        res.status(201).json({ ...respInventoryData, attachments: respAttachmentsData });
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

        res.status(200).json(resp);
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

        res.status(200).json(resp);
    } catch (error: any) {
        next({
            statusCode: 400,
            message: "Failed to delete inventory. Please try again later.",
        });
    }
};
