interface ResponseParams {
    success: boolean;
    code: number;
    message: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
}

/**
 * Formats the response object.
 *
 * @param {ResponseParams} params - The response parameters.
 * @returns {ResponseParams} - The formatted response object.
 */
export const formatResponse = ({ success, code, message, data }: ResponseParams): ResponseParams => {
    return {
        success,
        code,
        message,
        data,
    };
};

interface ResponsePaginatedParams {
    success: boolean;
    code: number;
    message: string;
    data: unknown[];
    meta: {
        page: number;
        pageSize: number;
        orderBy: string;
        orderDirection: string;
    };
}

/**
 * Formats a paginated response.
 *
 * @param {ResponsePaginatedParams} params - The parameters for formatting the response.
 * @returns {ResponsePaginatedParams} - The formatted response.
 */
export const formatResponsePaginated = ({
    success,
    code,
    message,
    data,
    meta,
}: ResponsePaginatedParams): ResponsePaginatedParams => {
    return {
        success,
        code,
        message,
        data,
        meta,
    };
};

interface ErrorResponseParams {
    success: boolean;
    code: number;
    message: string;
    error: unknown;
}

/**
 * Formats an error response.
 *
 * @param {ErrorResponseParams} params - The parameters for formatting the error response.
 * @returns {ErrorResponseParams} - The formatted error response.
 */
export const formatErrorResponse = ({ success, code, message, error }: ErrorResponseParams): ErrorResponseParams => {
    return {
        success,
        code,
        message,
        error,
    };
};
