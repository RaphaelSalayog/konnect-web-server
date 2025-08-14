import { supabase } from "./supabaseClient";

export const handlePresignedUrl = async (bucket_name: string, path: string, duration = 60) => {
    try {
        const file_id = path.split(bucket_name + "/")[1];
        const { data, error } = await supabase.storage
            .from(bucket_name)
            .createSignedUrl(file_id, duration);

        if (error) {
            throw error;
        }

        return data?.signedUrl;
    } catch (error) {
        throw error;
    }
};
