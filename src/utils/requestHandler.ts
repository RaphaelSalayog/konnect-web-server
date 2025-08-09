interface Pagination {
    page: number;
    limit: number;
}

interface RequestHandlerParams<T = unknown> {
    body?: {
        payload?: T;
        search?: string;
        filters?: Record<string, any>;
        pagination?: Pagination;
    };
    paginationDefault?: Pagination;
}

interface RequestHandlerResult<T = unknown> {
    payload: T;
    search: string;
    filters: Record<string, any>;
    pagination: {
        offset: number;
        limit: number;
    };
}

export const requestHandler = <T = unknown>({
    body,
    paginationDefault = { page: 1, limit: 10 },
}: RequestHandlerParams<T>): RequestHandlerResult<T> => {
    const {
        payload = {} as T,
        search = "",
        filters = {},
        pagination = paginationDefault,
    } = body || {};

    const { limit, page } = pagination;

    return {
        payload,
        search,
        filters,
        pagination: {
            offset: (page - 1) * limit,
            limit,
        },
    };
};
