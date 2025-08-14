import Attachment from "./attachment";
import Inventory from "./inventory";
import User from "./user";

const relationships = () => {
    Inventory.hasMany(Attachment, { as: "attachments", foreignKey: "inventory_id" });
    Attachment.belongsTo(Inventory, { as: "inventory", foreignKey: "inventory_id" });

    User.hasMany(Attachment, { foreignKey: "user_id" });
    Attachment.belongsTo(User, { foreignKey: "user_id" });
};

export default relationships;
