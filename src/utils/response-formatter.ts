interface ResponseParams {
    success: boolean;
    code: number;
    message: string;
    data: unknown[];
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
