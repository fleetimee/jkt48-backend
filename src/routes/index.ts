import express from 'express';

import auth from './auth/api';
import news from './news/api';
import packet from './packet/api';
import posts from './posts/api';
import privacyPolicy from './privacy-policy/api';
import terms from './terms/api';
import user from './user/api';

const router = express.Router();

router.use('/', auth);
router.use('/user', user);
router.use('/posts', posts);
router.use('/news', news);
router.use('/package', packet);
router.use('/privacy-policy', privacyPolicy);
router.use('/terms', terms);

export default router;
