import express from "express";
import {
    createInventory,
    deleteInventory,
    getAllInventory,
    getInventoryById,
    updateInventory,
} from "../controller/inventory";

const inventoryRouter = express.Router();

inventoryRouter.post("/getAllInventory", getAllInventory);
inventoryRouter.post("/getInventoryById", getInventoryById);
inventoryRouter.post("/createInventory", createInventory);
inventoryRouter.post("/updateInventory", updateInventory);
inventoryRouter.post("/deleteInventory", deleteInventory);

export default inventoryRouter;
