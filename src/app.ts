// import * as Sentry from '@sentry/node';
// import { nodeProfilingIntegration } from '@sentry/profiling-node';
import bodyParser from 'body-parser';
import compression from 'compression';
import cookies from 'cookie-parser';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import monitor from 'express-status-monitor';
import { credential } from 'firebase-admin';
import { initializeApp, ServiceAccount } from 'firebase-admin/app';
import helmet from 'helmet';
import { StatusCodes } from 'http-status-codes';
import morgan from 'morgan';
import appleReceiptVerify from 'node-apple-receipt-verify';
import cron from 'node-cron';
import responseTime from 'response-time';
import swStat from 'swagger-stats';
import swaggerUi from 'swagger-ui-express';

import { APPLE_SECRET_KET, BASE_URL } from './config';
import serviceAccount from './config/service-account.json';
import { infoMiddleware } from './middlewares/author-info';
import { errorHandler } from './middlewares/error-handler';
import loggingMiddleware from './middlewares/logging';
import { rateLimiter5Minutes } from './middlewares/rate-limiter';
import routes from './routes';
import { specs } from './utils/swagger-options';

export const userAgentMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const userAgent = req.get('User-Agent');

    if (userAgent && userAgent.includes('axios')) {
        return res.status(StatusCodes.FORBIDDEN).json({ message: 'Access denied' });
    }

    next();
};

/**
 * Express application.
 * An instance of the express module is created and assigned to the app variable.
 * This instance is used to configure and start the server.
 * Express is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.
 * It is an open-source framework developed and maintained by the Node.js foundation.
 * Express is used to build web applications and APIs.
 * It is the standard server framework for Node.js.
 * Express is built on top of the Node.js HTTP module, and it helps in managing the server and routes.
 * It provides a thin layer of fundamental web application features, without obscuring Node.js features that you know and love.
 * It is a minimal, fast, and unopinionated web framework for Node.js.
 */
const app = express();

initializeApp({
    credential: credential.cert(serviceAccount as ServiceAccount),
});

appleReceiptVerify.config({
    secret: APPLE_SECRET_KET as string,
    verbose: true,
    environment: ['sandbox'],
});

// Sentry.init({
//     dsn: 'https://d02e5c085e63bf791fac8ca3f3cc4589@o4507197243981824.ingest.us.sentry.io/4507197246144512',
//     integrations: [
//         // enable HTTP calls tracing
//         new Sentry.Integrations.Http({ tracing: true }),
//         // enable Express.js middleware tracing
//         new Sentry.Integrations.Express({ app }),
//         nodeProfilingIntegration(),
//     ],
//     // Performance Monitoring
//     tracesSampleRate: 1.0, //  Capture 100% of the transactions
//     // Set sampling rate for profiling - this is relative to tracesSampleRate
//     profilesSampleRate: 1.0,
// });

// // The request handler must be the first middleware on the app
// app.use(Sentry.Handlers.requestHandler());

// // TracingHandler creates a trace for every incoming request
// app.use(Sentry.Handlers.tracingHandler());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, { explorer: true }));

/**
 * Morgan, a HTTP request logger middleware for Node.js.
 * It simplifies the process of logging requests to your application.
 * When you use Morgan, it automatically logs requests details to your application in a specified format.
 * Here 'dev' format is used which is a pre-defined format provided by Morgan.
 */
app.use(morgan('dev'));

app.use(responseTime());

app.use(
    monitor({
        path: '/health-check',
        title: 'JKT48 API PM Status',
    }),
);

/**
 * My logging middleware.
 * This middleware function is used to log details about the request and response objects.
 * The specifics of what it logs and how it logs them depend on how you've defined the middleware.
 */
app.use(loggingMiddleware);

// Use the user agent middleware
app.use(userAgentMiddleware);

/**
 * Helmet, a collection of middleware functions that help secure Express apps by setting various HTTP headers.
 * Helmet can help protect your app from some well-known web vulnerabilities by default.
 */
app.use(helmet());

/**
 * Compression, a middleware for Node.js that compresses response bodies for all request that traverse through the middleware.
 * It uses the zlib library for compression and provides support for 'gzip' and 'deflate' encoding.
 */
app.use(compression());

/**
 * express.json() middleware.
 * This is a built-in middleware function in Express.
 * It parses incoming requests with JSON payloads and is based on body-parser.
 * The middleware is capable of parsing incoming request bodies in a middleware before your handlers, available under the req.body property.
 */
app.use(express.json());

/**
 * cookies middleware.
 * This middleware function is used to parse Cookie header and populate req.cookies with an object keyed by the cookie names.
 * It can be used to read the cookies sent from the client's browser in your Express application.
 */
app.use(cookies());

/**
 * bodyParser middleware.
 * This middleware function is used to parse the incoming request bodies in a middleware before your handlers, available under the req.body property.
 * It is based on body-parser.
 */
app.use(bodyParser.json());

/**
 * bodyParser.urlencoded middleware.
 * This middleware function is used to parse incoming request bodies in a middleware before your handlers, available under the req.body property.
 * It is based on body-parser.
 */
app.use(bodyParser.urlencoded({ extended: true }));

app.use(function (req, res, next) {
    res.setHeader('X-Powered-By', '@fleetime');
    next();
});

/**
 * cors middleware.
 * This middleware function is used to enable Cross-Origin Resource Sharing (CORS) with various options.
 * CORS is a mechanism that uses additional HTTP headers to tell browsers to give a web application running at one origin, access to selected resources from a different origin.
 */
app.use(
    cors({
        credentials: true,
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    }),
);

// Serve Static files
app.use('/static', express.static('static'));

app.use('/robots.txt', express.static('static/robots.txt'));

// Schedule tasks to be run on the server.
// This cron job will run at 00:00 every Sunday.
// Top idols scheduler
cron.schedule('0 0 * * 0', function () {
    console.log('Running store top idols by order transaction every Sunday midnight');
    try {
        fetch(`${BASE_URL}/api/top-idol/by-week`)
            .then(res => res.json())
            .then(data => console.log(data))
            .catch(err => console.error(err));
    } catch (error) {
        console.error('Error updating top idol table:', error);
    }
});

// This cron job will run every 10 minutes.
// Check for expired orders scheduler
cron.schedule('*/10 * * * *', function () {
    console.log('Running check for expired orders every 10 minutes');
    try {
        fetch(`${BASE_URL}/api/order/check-expired`)
            .then(res => res.json())
            .then(data => console.log(data))
            .catch(err => console.error(err));
    } catch (error) {
        console.error('Error checking for expired orders:', error);
    }
});

// This cron job will run at 00:00 every day.
// Birthday messages scheduler
cron.schedule('0 0 * * *', function () {
    console.log('Running scheduled birthday messages every day at midnight');
    try {
        fetch(`${BASE_URL}/api/messages/executeBirthdayScheduler`)
            .then(res => res.json())
            .then(data => console.log(data))
            .catch(err => console.error(err));
    } catch (error) {
        console.error('Error running scheduled birthday messages:', error);
    }
});

// This cron job will run at 00:00 every day.
// Order expiration reminder for renewal scheduler
cron.schedule('0 0 * * *', function () {
    console.log('Running scheduled order expiration reminder for renewal every day at midnight');
    try {
        fetch(`${BASE_URL}/api/invoice/scheduledInvoice`)
            .then(res => res.json())
            .then(data => console.log(data))
            .catch(err => console.error(err));
    } catch (error) {
        console.error('Error running scheduled order expiration reminder for renewal:', error);
    }
});

// This cron job will run at 00:00 at the end of the month.
// Remove stale fcm tokens
cron.schedule('0 0 1 * *', function () {
    console.log('Running remove stale fcm tokens at the end of the month');

    try {
        fetch(`${BASE_URL}/api/token/removeStaleTokens`)
            .then(res => res.json())
            .then(data => console.log(data))
            .catch(err => console.error(err));
    } catch (error) {
        console.error('Error removing stale fcm tokens:', error);
    }
});

/**
 * Rate limiter middleware.
 * This middleware function is used to limit repeated requests to public APIs and/or endpoints such as password reset.
 * It is based on express-rate-limit.
 */
app.use(rateLimiter5Minutes);

// Set timeout on all requests
app.use((req, res, next) => {
    const timeout = setTimeout(() => {
        return res.status(408).json({ message: 'Request timed out' });
    }, 60000); // Set timeout to 10 seconds

    res.on('finish', () => {
        clearTimeout(timeout);
    });

    next();
});

/**
 * Root Route Introduction.
 */
app.get('/', infoMiddleware, (req, res) => {
    res.json(res.locals.info);
});

app.use(swStat.getMiddleware({ swaggerSpec: specs }));

/**
 * Routes middleware.
 */
app.use('/api', routes);

// The error handler must be registered before any other error middleware and after all controllers
// app.use(Sentry.Handlers.errorHandler());

app.use((req, res, next) => {
    res.status(404).json({ message: 'Where are you going ?' });

    next();
});

/**
 * Error handling middleware.
 * This middleware function is used to handle errors that occur in the application.
 * It is based on express-async-errors.
 */
app.use(errorHandler);

export default app;
