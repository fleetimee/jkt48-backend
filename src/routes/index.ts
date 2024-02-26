import express from 'express';

import auth from './auth/api';
import posts from './posts/api';
import user from './user/api';

const router = express.Router();

router.use('/', auth);
router.use('/user', user);
router.use('/posts', posts);

export default router;
