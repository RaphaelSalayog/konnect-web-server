import { NextFunction, Request, Response } from "express";
import { col, fn, Op, where } from "sequelize";
import { BUCKET_NAME, TABLE_NAME } from "../constants/constants";
import { handleAttachPresignedUrls } from "../helper/handleAttachPresignedUrls";
import { handleAttachments } from "../helper/handleAttachments";
import { handleRequest } from "../helper/handleRequest";
import { handleStripKeys } from "../helper/handleStripKeys";
import Attachment from "../model/attachment";
import Inventory from "../model/inventory";
import sequelize from "../utils/database";

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
            distinct: true, // Ensures we count only unique Inventory rows, avoiding duplicates caused by joined Attachments
            where: whereCondition,
            attributes: { exclude: ["createdAt", "deletedAt"] },
            limit,
            offset,
            order: [["updatedAt", "DESC"]], // do not use 'attributes: { exclude: ["updatedAt"] }' if you are using it in order
            include: [
                {
                    model: Attachment, // This will create an INNER JOIN
                    as: "attachments",
                    attributes: ["id", "file_name", "file_path"],
                    required: false, // Left Join
                },
            ],
        });

        const dataWithPresignedUrls = await handleAttachPresignedUrls(
            resp.rows,
            BUCKET_NAME.inventory,
            ["attachments"]
        );

        const modifiedData = dataWithPresignedUrls.map(({ updatedAt, ...restData }) => restData); // to remove updatedAt key

        res.status(200).json({ lists: modifiedData, total: resp.count });
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
            },
            attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
            include: [
                {
                    model: Attachment, // This will create an INNER JOIN
                    as: "attachments",
                    attributes: ["id", "file_name", "file_path"],
                    required: false, // Left Join
                },
            ],
        });

        if (!resp) {
            return null;
        }

        const dataWithPresignedUrls = await handleAttachPresignedUrls(
            [resp],
            BUCKET_NAME.inventory,
            ["attachments"]
        );

        res.status(200).json(...dataWithPresignedUrls);
    } catch (error: any) {
        next({
            statusCode: 400,
            message: "Failed to get inventory by id. Please try again later.",
        });
    }
};

export const createInventory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // For Transaction commit/rollback
        await sequelize.transaction(async (t) => {
            const { attachments, ...restDataPayload } = req.body;

            const respInventory = await Inventory.create(restDataPayload, { transaction: t });
            const respInventoryData = handleStripKeys(respInventory, [
                "createdAt",
                "updatedAt",
                "deletedAt",
            ]);

            const respAttachments = await handleAttachments(
                attachments,
                TABLE_NAME.inventory,
                respInventoryData.id,
                t
            );

            const respAttachmentsData = respAttachments.map((attachment) =>
                handleStripKeys(attachment, [
                    "createdAt",
                    "updatedAt",
                    "deletedAt",
                    "inventory_id",
                    "user_id",
                ])
            );

            res.status(201).json({ ...respInventoryData, attachments: respAttachmentsData });
        });
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
