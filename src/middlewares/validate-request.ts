import { NextFunction, Request, Response } from 'express';
import { AnyZodObject, ZodError } from 'zod';

/**
 * Middleware function that validates the request against a given schema.
 * If the request is valid, it calls the next middleware function.
 * If the request is invalid, it sends a response with the validation errors.
 *
 * @param schema - The schema to validate the request against.
 * @returns A middleware function that validates the request.
 */
export const validateSchema = (schema: AnyZodObject) => (req: Request, res: Response, next: NextFunction) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    } catch (error) {
        if (error instanceof ZodError) {
            return res
                .status(422)
                .send({ errors: error.issues.map(issue => ({ field: issue.path[1], message: issue.message })) });
        }
        return next(error);
    }
};
