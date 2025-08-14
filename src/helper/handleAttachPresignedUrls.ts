import { handlePresignedUrl } from "./handlePresignedUrl";

type IHandleAttachPresignedUrls<T> = {
    dataSet: T[];
    bucketName: string;
    attachmentKeys: string[];
};

export const handleAttachPresignedUrls = async <T extends { [key: string]: any }>({
    dataSet,
    bucketName,
    attachmentKeys,
}: IHandleAttachPresignedUrls<T>) => {
    return Promise.all(
        dataSet.map(async (data) => {
            const plainRow = data.get ? data.get({ plain: true }) : data;

            for (const key of attachmentKeys) {
                if (plainRow[key]?.length) {
                    plainRow[key] = await Promise.all(
                        plainRow[key].map(async (attachment: any) => {
                            const presignedUrl = await handlePresignedUrl({
                                bucketName,
                                path: attachment.file_path,
                            });
                            return { ...attachment, presignedUrl };
                        })
                    );
                }
            }

            return plainRow;
        })
    );
};
