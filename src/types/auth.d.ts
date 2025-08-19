export interface DecodedUser {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
    auth_provider: string;
    google_id: string | null;
    profile_picture: string | null;
    iat: number;
}
