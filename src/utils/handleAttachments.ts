import Attachment from "../model/attachment";

type IAttachment = {
    id?: number;
    file_name: string;
    s3_key: string;
};

export const handleAttachments = async (
    attachments: IAttachment[],
    tableName: string,
    entity_id: number
) => {
    try {
        const modifiedAttachment = attachments.map((item) => ({
            ...item,
            [tableName + "_id"]: entity_id,
        }));

        const newAttachments = modifiedAttachment.filter((item) => !item.id);
        const existingAttachments = modifiedAttachment.filter((item) => item.id);

        const results: any[] = [];

        if (newAttachments.length > 0) {
            const resp = await Attachment.bulkCreate(newAttachments);
            results.push(...resp);
        }

        if (existingAttachments.length > 0) {
            const resp = await Attachment.bulkCreate(existingAttachments, {
                updateOnDuplicate: ["file_name", "s3_key"], // Fields you want to update
            });
            results.push(...resp);
        }

        return results;
    } catch (error) {
        throw error;
    }
};
