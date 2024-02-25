interface ResponseParams {
    success: boolean;
    code: number;
    message: string;
    data: unknown[];
}

export const formatResponse = ({ success, code, message, data }: ResponseParams): ResponseParams => {
    return {
        success,
        code,
        message,
        data,
    };
};
