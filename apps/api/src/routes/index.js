import { Router } from 'express';
import healthCheck from './health-check.js';
import searchQuranRouter from './search-quran.js';
import searchHadithRouter from './search-hadith.js';
import stripeRouter from './stripe.js';

const router = Router();

export default () => {
    router.get('/health', healthCheck);
    router.use('/search', searchQuranRouter);
    router.use('/search', searchHadithRouter);
    router.use('/stripe', stripeRouter);

    return router;
};
