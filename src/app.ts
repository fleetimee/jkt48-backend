import bodyParser from 'body-parser';
import compression from 'compression';
// import console from 'console';
import cookies from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

// import cron from 'node-cron';
import { errorHandler } from './middlewares/error-handler';
import loggingMiddleware from './middlewares/logging';
import { rateLimiter } from './middlewares/rate-limiter';
import routes from './routes';

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

/**
 * Morgan, a HTTP request logger middleware for Node.js.
 * It simplifies the process of logging requests to your application.
 * When you use Morgan, it automatically logs requests details to your application in a specified format.
 * Here 'dev' format is used which is a pre-defined format provided by Morgan.
 */
app.use(morgan('dev'));

/**
 * My logging middleware.
 * This middleware function is used to log details about the request and response objects.
 * The specifics of what it logs and how it logs them depend on how you've defined the middleware.
 */
app.use(loggingMiddleware);

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

// Server Static files
app.use('/static', express.static('static'));

// Schedule tasks to be run on the server.
// This cron job will run at 00:00 every Sunday.
// cron.schedule('*/5 * * * * *', function () {
//     console.log('Running a task every 5 seconds');
//     try {
//         console.log('Updating top idol table');
//     } catch (error) {
//         console.error('Error updating top idol table:', error);
//     }
// });

/**
 * Rate limiter middleware.
 * This middleware function is used to limit repeated requests to public APIs and/or endpoints such as password reset.
 * It is based on express-rate-limit.
 */
app.use(rateLimiter);

/**
 * Routes middleware.
 */
app.use('/api', routes);

/**
 * Error handling middleware.
 * This middleware function is used to handle errors that occur in the application.
 * It is based on express-async-errors.
 */
app.use(errorHandler);

export default app;
