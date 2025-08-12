import { DataTypes } from "sequelize";
import sequelize from "../utils/database";

const User = sequelize.define(
    "User",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password_hash: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        auth_provider: {
            type: DataTypes.ENUM("local", "google"),
            allowNull: false,
        },
        google_id: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        profile_picture: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        // last_login: {
        //     type: DataTypes.DATE,
        //     allowNull: true,
        // },
        // is_verified: {
        //     type: DataTypes.BOOLEAN,
        //     defaultValue: false,
        // },
    },
    {
        paranoid: true, // adds deletedAt for soft deletes
    }
);

export default User;
