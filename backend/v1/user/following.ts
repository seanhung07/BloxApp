import {Response} from 'express'
import BloxResponse from "../../classes/BloxResponse"
import {requireLoggedIn} from "../../middleware/firebase";
import express from "express";
import {BloxExpressRequest} from "../../classes/BloxExpressRequest";
import DatabaseWrapper from "../../db/DatabaseWrapper";
import BloxBlockchain from "../../classes/BloxBlockchain";
const router = express.Router();

router.get('/', requireLoggedIn, async (req: BloxExpressRequest, res: Response): Promise<void> => {
  if(!req.account) {
    res.status(401);
    res.json(new BloxResponse(undefined, "Not logged in."));
    return;
  }
  const db = new DatabaseWrapper()
  await db.connect();
  const following = await req.account.getFollowing(db);
  await db.close();
  const followingIds = following.map((bc) => bc.getObjectId().toHexString())
  res.json(new BloxResponse(followingIds));
});

router.put('/:ticker', requireLoggedIn, async (req: BloxExpressRequest, res: Response): Promise<void>  => {
  if(!req.account) {
    res.status(401);
    res.json(new BloxResponse(undefined, "Not logged in."));
    return;
  }
  const db = new DatabaseWrapper()
  await db.connect();
  try {
    const blockchain = await BloxBlockchain.from(req.params.ticker, db);
    await req.account.follow(blockchain, db);
    await db.close();
    res.json(new BloxResponse(undefined));
  } catch(e) {
    res.status(404);
    res.json(new BloxResponse(undefined, 'No blockchain exists with that ticker'));
  }
});

router.delete('/:ticker', requireLoggedIn, async (req: BloxExpressRequest, res: Response): Promise<void> => {
  if(!req.account) {
    res.status(401);
    res.json(new BloxResponse(undefined, "Not logged in."));
    return;
  }
  const db = new DatabaseWrapper()
  await db.connect();
  try {
    const blockchain = await BloxBlockchain.from(req.params.ticker, db);
    await req.account.unfollow(blockchain, db);
    await db.close();
    res.json(new BloxResponse(undefined));
  } catch(e) {
    res.status(404);
    res.json(new BloxResponse(undefined, 'No blockchain exists with that ticker'));
  }
});

export default router;
