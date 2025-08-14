import cors from "cors";
import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import isAuth from "./middleware/isAuth";
import relationships from "./model";
import authRoute from "./routes/auth";
import inventoryRouter from "./routes/inventory";
import { connectDB } from "./utils/database";

dotenv.config();
const app = express();
const PORT = 8080;

app.use(
    express.json(),
    cors({
        origin: process.env.CLIENT_URL,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        credentials: true,
    }),
    express.json()
);

relationships();
app.use(authRoute);
app.use("/inventory", isAuth, inventoryRouter);

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
    console.log(error);
    const statusCode = error.statusCode || 500;
    const message = error.message;

    res.status(statusCode).json({ message: message, statusCode: statusCode });
});

connectDB(() => {
    app.listen(PORT, () => {
        console.log(`Server is running at http://localhost:${PORT}`);
    });
});
