import { DataTypes } from "sequelize";
import sequelize from "../utils/database";

const Inventory = sequelize.define("Inventory", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    unit_cost: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    price: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    photo: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    isDeleted: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
});

export default Inventory;
