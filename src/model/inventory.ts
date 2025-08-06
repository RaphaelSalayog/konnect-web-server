import { DataTypes } from "sequelize";
import bcrypt from "bcrypt";
import sequelize from "../utils/database";

const User = sequelize.define("User", {
    // id: {
    //     type: DataTypes.UUID,
    //     defaultValue: DataTypes.UUIDV4,
    //     primaryKey: true,
    // },
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        set(value: string) {
            const salt = bcrypt.genSaltSync(10);
            (this as any).setDataValue("password", bcrypt.hashSync(value, salt));
        },
    },
});

export default User;
