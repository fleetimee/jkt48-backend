import express from 'express';

import auth from './auth/api';
import conversation from './conversation/api';
import idol from './idol/api';
import news from './news/api';
import packet from './packet/api';
import posts from './posts/api';
import privacyPolicy from './privacy-policy/api';
import terms from './terms/api';
import topIdol from './top-idol/api';
import user from './user/api';

const router = express.Router();

router.use('/', auth);
router.use('/user', user);
router.use('/posts', posts);
router.use('/news', news);
router.use('/package', packet);
router.use('/privacy-policy', privacyPolicy);
router.use('/terms', terms);
router.use('/idol', idol);
router.use('/top-idol', topIdol);
router.use('/conversation', conversation);

// Handle 404
router.use((req, res) => {
    res.status(404).send({ message: 'Not Found' });
});

export default router;
