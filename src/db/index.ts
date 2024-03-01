import { DefaultLogger, LogWriter } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

import { DB_DATABASE, DB_HOST, DB_MAX_CONNECTIONS, DB_PASSWORD, DB_PORT, DB_SSL, DB_USER } from '../config';
import * as schema from '../models/package';

const pg = postgres({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    ssl: DB_SSL,
    max: DB_MAX_CONNECTIONS,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onnotice: () => {},
});

class MyLogWriter implements LogWriter {
    private logger: winston.Logger;

    constructor() {
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.json(),
            transports: [
                new DailyRotateFile({
                    filename: 'logs/drizzle/drizzle-queries-%DATE%.log',
                    datePattern: 'YYYY-MM-DD',
                    zippedArchive: true,
                    maxSize: '20m',
                    maxFiles: '14d',
                }),
            ],
        });
    }

    write(message: string) {
        const formattedMessage = message.replace(/\n/g, ' ');
        const timestamp = new Date().toISOString();
        this.logger.info(`${timestamp} - ${formattedMessage}`);
    }
}

const logger = new DefaultLogger({ writer: new MyLogWriter() });

const db = drizzle(pg, { schema: schema, logger });

migrate(db, { migrationsFolder: 'drizzle' });

export default db;
