/* eslint-disable @typescript-eslint/no-explicit-any */
import cron from 'node-cron';

import { BASE_URL } from './config';

export const runCronJobs = () => {
    // All your cron jobs go here

    // Schedule tasks to be run on the server.
    // This cron job will run at 00:00 every Sunday.
    // Top idols scheduler
    cron.schedule('0 0 * * 0', function () {
        console.log('Running store top idols by order transaction every Sunday midnight');
        try {
            fetch(`${BASE_URL}/api/top-idol/by-week`)
                .then((res: { json: () => any }) => res.json())
                .then((data: any) => console.log(data))
                .catch((err: any) => console.error(err));
        } catch (error) {
            console.error('Error updating top idol table:', error);
        }
    });

    // This cron job will run every minute.
    // Check for expired orders scheduler
    cron.schedule('* * * * *', function () {
        console.log('Running check for expired orders every minute');
        try {
            fetch(`${BASE_URL}/api/order/check-expired`)
                .then((res: { json: () => any }) => res.json())
                .then((data: any) => console.log(data))
                .catch((err: any) => console.error(err));
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
                .then((res: { json: () => any }) => res.json())
                .then((data: any) => console.log(data))
                .catch((err: any) => console.error(err));
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
                .then((res: { json: () => any }) => res.json())
                .then((data: any) => console.log(data))
                .catch((err: any) => console.error(err));
        } catch (error) {
            console.error('Error running scheduled order expiration reminder for renewal:', error);
        }
    });
};
