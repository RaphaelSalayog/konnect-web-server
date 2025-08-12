// To remove Keys in an object
export const stripKeys = (model: any, keysToRemove: string[] = []) => {
    const plain = model.get ? model.get({ plain: true }) : model;
    return Object.fromEntries(
        Object.entries(plain).filter(([key]) => !keysToRemove.includes(key))
    ) as any;
};
