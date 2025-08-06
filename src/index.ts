import dotenv from "dotenv";
import express, { Request, Response, NextFunction } from "express";
// import { createClient } from "@supabase/supabase-js";
import cors from "cors";

dotenv.config();
const app = express();
const PORT = 8080;

app.use(express.json());

// const supabaseUrl = process.env.SUPABASE_URL;
// const supabaseKey = process.env.SUPABASE_KEY;
// export const supabase = createClient(supabaseUrl || "", supabaseKey || "");

app.use(
    cors({
        origin: process.env.CLIENT_URL,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        credentials: true,
    }),
    express.json()
);
// app.use(authRoute);
// app.use("/employee", isAuth, employeeRoute);

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
    console.log(error);
    const statusCode = error.statusCode || 500;
    const message = error.message;

    res.status(statusCode).json({ message: message, statusCode: statusCode });
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
