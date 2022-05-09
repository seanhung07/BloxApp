import express from 'express';
import UserHandler from './user'
import NewsHandler from './news'
import ClassroomHandler from './classroom'
import WalletsHandler from './wallets'
import CryptoHandler from './crypto'
import LeaderboardHandler from './leaderboard'
const router = express.Router()

router.use('/user', UserHandler);
router.use('/news', NewsHandler);
router.use('/classroom', ClassroomHandler);
router.use('/wallets', WalletsHandler);
router.use('/crypto', CryptoHandler);
router.use('/leaderboard', LeaderboardHandler);

export default router;
