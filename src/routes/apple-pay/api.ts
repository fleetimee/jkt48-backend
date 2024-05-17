import express from 'express';

const router = express.Router();

router.post('/verify', async (req, res, next) => {
    try {
        const { body } = req;

        console.log('Apple Pay verify body', body);
    } catch (error) {
        next(error);
    }
});
