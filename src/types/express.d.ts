import { DecodedUser } from "./auth";

declare global {
    namespace Express {
        interface Request {
            user?: DecodedUser; // Type `user` with your User model or any specific type
        }
    }
}
