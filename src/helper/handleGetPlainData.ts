// To remove Keys in an object

type IHandleGetPlainData = {
    dataSet: any;
    keysToRemove?: string[]; // optional, defaults to []
};

export const handleGetPlainData = ({ dataSet, keysToRemove = [] }: IHandleGetPlainData) => {
    const plainData = dataSet.get ? dataSet.get({ plain: true }) : dataSet;
    return Object.fromEntries(
        Object.entries(plainData).filter(([key]) => !keysToRemove.includes(key))
    ) as any;
};
