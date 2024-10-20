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

/**
 * Middleware function to limit the rate of incoming requests.
 *
 * This rate limiter is configured to allow a maximum of 1000 requests per minute
 * from a single IP address. The time window for this rate limit is set to 1 minute.
 *
 * @constant
 * @type {import("express-rate-limit").RateLimit}
 * @default
 * @param {number} windowMs - The time window in milliseconds for which the rate limit is calculated.
 * @param {number} max - The maximum number of requests allowed within the time window.
 * @param {object} config - Additional configuration options for the rate limiter.
 */
export const rateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute window
    max: 1000, // 1000 requests allowed per minute
    ...config,
});

export const rateLimiter5Minutes = rateLimit({
    windowMs: 5 * 60 * 1000, // 10 minute window
    max: 1000, // 1000 requests allowed per 10 minutes
    // Add any additional configuration options here
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
