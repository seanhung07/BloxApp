import * as firebaseAdmin from 'firebase-admin'
import {NextFunction, Response} from 'express'
import BloxResponse from "../classes/BloxResponse";
import BloxUser from "../classes/BloxUser";
import {BloxExpressRequest} from "../classes/BloxExpressRequest";
import DatabaseWrapper from "../db/DatabaseWrapper";

const serviceAccount = require("../firebase-priv-key.json");

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount)
});

/**
 * Middleware that confirms the user is logged in via Firebase. If they are not, an error is sent. Otherwise, the next
 * middleware runs and the user's account info is inserted into the request object under req.account
 * @param req
 * @param res
 * @param next
 */
async function requireLoggedIn(req: BloxExpressRequest, res: Response, next: NextFunction) {
  const authHeader = req.get('Authorization');
  if(!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401);
    res.json(new BloxResponse(undefined, 'Illegal Google Authorization token'));
    return;
  }
  const token: string|undefined = req.get('Authorization')?.split(' ')[1];
  if(token === undefined) {
    res.status(401);
    res.json(new BloxResponse(undefined, 'Illegal Google Authorization token'));
    return;
  }
  try {
    const decodeValue = await firebaseAdmin.auth().verifyIdToken(token);
    if(!decodeValue) {
      res.status(401);
      res.json(new BloxResponse(undefined, 'Invalid Google Authorization token'));
      return;
    }
    const db = new DatabaseWrapper();
    await db.connect();
    req.account = await BloxUser.createIfNotExists(decodeValue.uid, db);
    await db.close();
    next();
  } catch(e) {
    console.error(e);
    res.status(500);
    res.json(new BloxResponse(undefined, 'Invalid Google Authorization token or server error.'))
  }
}

export {firebaseAdmin, requireLoggedIn};
