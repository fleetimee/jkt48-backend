import rateLimit from 'express-rate-limit';

const config = {
    message: "Sorry, you've sent too many requests. Please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false },
};

/**
 * Applies rate limiting to the specified route.
 * @param {Object} config - The configuration options for rate limiting.
 * @param {number} config.windowMs - The time window in milliseconds for rate limiting.
 * @param {number} config.max - The maximum number of requests allowed within the time window.
 * @returns {Function} - The rate limiter middleware function.
 */
export const rateLimiter = rateLimit({
    windowMs: 5 * 1000,
    max: 100,
    ...config,
});

/**
 * Applies rate limiting to the specified route handler.
 * @param {Object} config - The rate limiting configuration.
 * @param {number} config.windowMs - The time window in milliseconds.
 * @param {number} config.max - The maximum number of requests allowed within the time window.
 * @returns {Function} - The rate limiting middleware function.
 */
export const rateLimiterStrict = rateLimit({
    windowMs: 10 * 1000,
    max: 3,
    ...config,
});
