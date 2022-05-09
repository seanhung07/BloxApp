import {Response} from 'express'
import BloxResponse from "../../classes/BloxResponse"
import {requireLoggedIn} from "../../middleware/firebase";
import express from "express";
import {BloxExpressRequest} from "../../classes/BloxExpressRequest";
import DatabaseWrapper from "../../db/DatabaseWrapper";
import BloxUser from "../../classes/BloxUser";
import FollowingHandler from './following'
const router = express.Router();

router.use('/following', FollowingHandler);

router.get('/', requireLoggedIn, (req: BloxExpressRequest, res: Response): void => {
  if(!req.account) {
    res.status(401);
    res.json(new BloxResponse(undefined, "Not logged in."));
    return;
  }
  res.json(new BloxResponse({
    _id: req.account.getObjectId(),
    id: req.account.getAccountId(),
    firstName: req.account.getFirstName(),
    lastName: req.account.getLastName(),
    type: req.account.getAccountType(),
    public: req.account.isAccountPublic()
  }));
});

router.get('/:id', requireLoggedIn, (req: BloxExpressRequest, res: Response): void => {
  // If the user's trying to get an account that isn't their own
  if(!req.account || req.account.getObjectId().toHexString() !== req.params.id) {
    res.status(403);
    res.json(new BloxResponse(undefined, "Insufficient permissions."));
    return;
  }
  res.json(new BloxResponse({
    _id: req.account.getObjectId(),
    id: req.account.getAccountId(),
    firstName: req.account.getFirstName(),
    lastName: req.account.getLastName(),
    type: req.account.getAccountType(),
    public: req.account.isAccountPublic()
  }));
});

router.patch('/:id', requireLoggedIn, async (req: BloxExpressRequest, res: Response): Promise<void> => {
  if(!req.account || req.account.getObjectId().toHexString() !== req.params.id) {
    res.status(403);
    res.json(new BloxResponse(undefined, "Insufficient permissions."));
    return;
  }
  res.status(200);
  const db = new DatabaseWrapper();
  await db.connect();
  const promises: Promise<void>[] = []
  if("firstName" in req.body) {
    promises.push(req.account.setFirstName(String(req.body.firstName), db));
  }
  if("lastName" in req.body) {
    promises.push(req.account.setLastName(String(req.body.lastName), db));
  }
  if("public" in req.body) {
    promises.push(req.account.setAccountPublic(!!req.body.public, db));
  }
  if("type" in req.body && ['Personal', 'Instructor', 'Student'].includes(req.body.type)) {
    promises.push(req.account.setAccountType(req.body.type, db));
  }
  await Promise.all(promises);

  req.account = await BloxUser.from(req.account.getObjectId(), db);
  await db.close();
  res.json(new BloxResponse({
    _id: req.account.getObjectId(),
    id: req.account.getAccountId(),
    firstName: req.account.getFirstName(),
    lastName: req.account.getLastName(),
    type: req.account.getAccountType(),
    public: req.account.isAccountPublic()
  }));
});

router.delete('/:id', requireLoggedIn, async (req: BloxExpressRequest, res: Response): Promise<void> => {
  if(!req.account || req.account.getObjectId().toHexString() !== req.params.id) {
    res.status(403);
    res.json(new BloxResponse(undefined, "Insufficient permissions."));
  }
  res.status(200);
  const db = new DatabaseWrapper();
  await db.connect();
  await req.account?.delete(db);
  await db.close();
  res.json(new BloxResponse(undefined));
});

export default router;
