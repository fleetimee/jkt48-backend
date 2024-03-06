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

const app = express();

app.use(morgan('dev'));

app.use(loggingMiddleware);

app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(cookies());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(function (req, res, next) {
    res.setHeader('X-Powered-By', '@fleetime');
    next();
});
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

app.use(rateLimiter);
app.use('/api', routes);

app.use(errorHandler);

export default app;
