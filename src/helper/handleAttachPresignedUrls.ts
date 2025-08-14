import { handlePresignedUrl } from "./handlePresignedUrl";

// utils/withPresignedUrls.ts
export async function handleAttachPresignedUrls<T extends { [key: string]: any }>(
    dataSet: T[],
    bucketName: string,
    attachmentKeys: string[]
) {
    return Promise.all(
        dataSet.map(async (data) => {
            const plainRow = data.get ? data.get({ plain: true }) : data;

            for (const key of attachmentKeys) {
                if (plainRow[key]?.length) {
                    plainRow[key] = await Promise.all(
                        plainRow[key].map(async (attachment: any) => {
                            const presignedUrl = await handlePresignedUrl(
                                bucketName,
                                attachment.file_path
                            );
                            return { ...attachment, presignedUrl };
                        })
                    );
                }
            }

            return plainRow;
        })
    );
}
