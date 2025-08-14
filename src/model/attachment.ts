import { DataTypes } from "sequelize";
import sequelize from "../utils/database";
import Inventory from "./inventory";
import User from "./user";

const Attachment = sequelize.define(
    "Attachment",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        file_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        file_path: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: User,
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },
        inventory_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: Inventory,
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },
    },
    {
        paranoid: true, // adds deletedAt for soft deletes
    }
);

export default Attachment;
