import { NextFunction, Request, Response } from "express";
import { col, fn, Op, where } from "sequelize";
import { BUCKET_NAME, TABLE_NAME } from "../constants/constants";
import { handleAttachPresignedUrls } from "../helper/handleAttachPresignedUrls";
import { handleAttachments } from "../helper/handleAttachments";
import { handleGetPlainData } from "../helper/handleGetPlainData";
import { handleRequest } from "../helper/handleRequest";
import Attachment from "../model/attachment";
import Inventory from "../model/inventory";
import sequelize from "../utils/database";

export const getAllInventory = async (req: Request, res: Response, next: NextFunction) => {
    const currentUser = req.user;
    const {
        search,
        filters,
        pagination: { offset, limit },
    } = handleRequest({ body: req.body });

    const whereCondition: any = {
        user_id: currentUser?.id,
    };

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

        const dataWithPresignedUrls = await handleAttachPresignedUrls({
            dataSet: resp.rows,
            bucketName: BUCKET_NAME.inventory,
            attachmentKeys: ["attachments"],
        });

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
        const currentUser = req.user;
        const { id } = req.body;
        const resp = await Inventory.findOne({
            where: {
                id: id,
                user_id: currentUser?.id,
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
            return res.status(404).json({ message: "Item does not exist!" });
        }

        const dataWithPresignedUrls = await handleAttachPresignedUrls({
            dataSet: [resp],
            bucketName: BUCKET_NAME.inventory,
            attachmentKeys: ["attachments"],
        });

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
            const currentUser = req.user;
            const { attachments, ...restDataPayload } = req.body;

            const respInventory = await Inventory.create(
                { ...restDataPayload, user_id: currentUser?.id },
                { transaction: t }
            );
            const respInventoryData = handleGetPlainData({
                dataSet: respInventory,
                keysToRemove: ["createdAt", "updatedAt", "deletedAt"],
            });

            const respAttachments = await handleAttachments({
                attachments,
                tableName: TABLE_NAME.inventory,
                entity_id: respInventoryData.id,
                transaction: t,
            });

            const respAttachmentsData = respAttachments.map((attachment) =>
                handleGetPlainData({
                    dataSet: attachment,
                    keysToRemove: [
                        "createdAt",
                        "updatedAt",
                        "deletedAt",
                        "inventory_id",
                        "user_id",
                    ],
                })
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
        const currentUser = req.user;
        const { id, attachments, ...restData } = req.body;

        const resp = await sequelize.transaction(async (t) => {
            const [affectedCount] = await Inventory.update(restData, {
                where: { id, user_id: currentUser?.id },
                returning: true,
                transaction: t,
            });

            if (affectedCount === 0) {
                return res.status(404).json({ message: "Item does not exist!" });
            }

            const respAttachmentsData = await Attachment.findAll({
                where: { inventory_id: id },
                transaction: t,
            });

            const existingIds = respAttachmentsData.map((a: any) => a.id);
            const payloadAttachmentsIds = attachments
                .filter((a: any) => a.id)
                .map((a: any) => a.id);
            const toDelete = existingIds.filter((dbId) => !payloadAttachmentsIds.includes(dbId));

            if (toDelete.length > 0) {
                await Attachment.destroy({
                    where: { id: toDelete },
                    transaction: t,
                });
            }

            await handleAttachments({
                attachments,
                tableName: TABLE_NAME.inventory,
                entity_id: id,
                transaction: t,
            });

            return { ok: true };
        });

        if (!(resp as any).ok) {
            throw new Error();
        }

        const respInventory = await Inventory.findOne({
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

        if (!respInventory) {
            return res.status(404).json({ message: "Item does not exist!" });
        }

        const dataWithPresignedUrls = await handleAttachPresignedUrls({
            dataSet: [respInventory],
            bucketName: BUCKET_NAME.inventory,
            attachmentKeys: ["attachments"],
        });

        res.status(200).json(...dataWithPresignedUrls);
    } catch (error) {
        next({
            statusCode: 400,
            message: "Failed to update inventory. Please try again later.",
        });
    }
};

export const deleteInventory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const currentUser = req.user;
        const { id } = req.body;
        const resp = await Inventory.destroy({
            where: { id, user_id: currentUser?.id },
        });

        res.status(200).json(resp);
    } catch (error: any) {
        next({
            statusCode: 400,
            message: "Failed to delete inventory. Please try again later.",
        });
    }
};
