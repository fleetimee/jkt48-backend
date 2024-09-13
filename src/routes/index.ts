import express from 'express';

import applePay from './apple-pay/api';
import auth from './auth/api';
import conversation from './conversation/api';
import googlePay from './google-pay/api';
import idol from './idol/api';
import inquiry from './inquiry/api';
import invoice from './invoice/api';
import messages from './messages/api';
import news from './news/api';
import order from './order/api';
import packet from './packet/api';
import posts from './posts/api';
import privacyPolicy from './privacy-policy/api';
import reaction from './reaction/api';
import subscription from './subscription/api';
import terms from './terms/api';
import token from './token/api';
import topIdol from './top-idol/api';
import upload from './upload/api';
import user from './user/api';
import xenditCallback from './xendit-callback/api';

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
router.use('/messages', messages);
router.use('/inquiry', inquiry);
router.use('/order', order);
router.use('/invoice', invoice);
router.use('/xendit-callback', xenditCallback);
router.use('/reaction', reaction);
router.use('/upload', upload);
router.use('/token', token);
router.use('/subscription', subscription);
router.use('/apple', applePay);
router.use('/google', googlePay);

// Handle 404
router.use((req, res) => {
    return res.status(404).send({ message: 'Not Found' });
});

export default router;
