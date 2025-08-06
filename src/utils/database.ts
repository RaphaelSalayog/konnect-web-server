import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
    "postgresql://postgres.vdffnprgzdqnxtaaquwy:Raphael123@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres",
    {
        dialect: "postgres",
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            },
        },
    }
);

export const connectDB = async (callback: () => void) => {
    try {
        await sequelize.authenticate();
        console.log("✅ Connected to PostgreSQL successfully!");
        await syncDB();
        await callback();
    } catch (error) {
        console.error("❌ Unable to connect to the database:", error);
    }
};

const syncDB = async () => {
    try {
        await sequelize.sync({ alter: true });
        console.log("✅ Database & tables synced!");
    } catch (error) {
        console.error("❌ Error syncing database:", error);
    }
};

export default sequelize;
