import { Transaction } from "sequelize";
import Attachment from "../model/attachment";

type IAttachment = {
    id?: number;
    file_name: string;
    file_path: string;
};

type IHandleAttachments = {
    attachments: IAttachment[];
    tableName: string;
    entity_id: number;
    transaction?: Transaction; // Optional transaction for commit/rollback
};

export const handleAttachments = async ({
    attachments,
    tableName,
    entity_id,
    transaction, // For Transaction commit/rollback
}: IHandleAttachments) => {
    try {
        const modifiedAttachment = attachments.map((item) => ({
            ...item,
            [tableName + "_id"]: entity_id,
        }));

        const newAttachments = modifiedAttachment.filter((item) => !item.id);
        // const existingAttachments = modifiedAttachment.filter((item) => item.id);

        const results: any[] = [];

        if (newAttachments.length > 0) {
            const resp = await Attachment.bulkCreate(newAttachments, {
                ...(transaction ? { transaction } : {}), // For Transaction commit/rollback
            });
            results.push(...resp);
        }

        // if (existingAttachments.length > 0) {
        //     const resp = await Attachment.bulkCreate(existingAttachments, {
        //         updateOnDuplicate: ["file_name", "file_path"], // Fields you want to update
        //         ...(transaction ? { transaction } : {}), // For Transaction commit/rollback
        //     });
        //     results.push(...resp);
        // }

        return results;
    } catch (error) {
        throw error;
    }
};
