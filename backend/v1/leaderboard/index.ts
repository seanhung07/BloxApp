import {Request, Response} from 'express'
import BloxResponse from "../../classes/BloxResponse"
import express from "express";
import DatabaseWrapper from "../../db/DatabaseWrapper";
import {ObjectId} from "mongodb";
import BloxUser from "../../classes/BloxUser";
import BloxBlockchain from "../../classes/BloxBlockchain";
const router = express.Router();


let cache: {[key: string]: {firstName?: string, lastName?: string, balance: number}}|undefined = undefined;
let cacheLastRefreshed = 0;
const cacheRefreshInterval = process.env.NODE_ENV === "production" ? 3600000 : 30000

async function calculateLeaderboard() {
  const db = new DatabaseWrapper();
  await db.connect();

  const collection = db.getWalletsCollection()
  const allWallets = await collection.find().toArray();

  cache = {};

  for(let i = 0; i < allWallets.length; i++) {
    const memberList: ObjectId[] = allWallets[i].admins || [];
    for(let j = 0; j < memberList.length; j++) {
      const memberHexId = memberList[j].toHexString();

      // calculate the balance in all the tickers for this wallet according
      // to the current exchange rate
      let balanceTotal : number = 0;
      for(let z = 0; z < Object.keys(allWallets[i].balance).length; z++) {
         let ticker : string = Object.keys(allWallets[i].balance)[z];

         if (ticker != 'USD') {
            const usdExchange = await BloxBlockchain.from(ticker, db);
            const exchangeRate = await usdExchange.getExchangeRate();

            balanceTotal += (allWallets[i].balance[ticker] * exchangeRate);
         } else {
            balanceTotal += allWallets[i].balance[ticker];
         }
      }

      if(cache[memberHexId] === undefined) {
         cache[memberHexId] = {balance: balanceTotal};
      } else {
         cache[memberHexId].balance += balanceTotal;
      }
    }
  }

  for(const memberId in cache) {
   if(cache.hasOwnProperty(memberId)) {
      const user = await BloxUser.from(new ObjectId(memberId), db);
      if(!user.isAccountPublic()) {
        delete cache[memberId];
        continue;
      }
      if (!user.getFirstName()) {
        cache[memberId].firstName = "ID: " + user.getAccountId();
        cache[memberId].lastName = "";
      } else {cache[memberId].firstName = user.getFirstName();
      cache[memberId].lastName = user.getLastName();
   }}
  }

  await db.close();
}

router.get('/', async (req: Request, res: Response): Promise<void> => {
  if(cacheLastRefreshed < Date.now() - cacheRefreshInterval || cache === undefined) {
    cacheLastRefreshed = Date.now();
    try {
      await calculateLeaderboard();
    } catch(e) {
      res.status(500);
      res.json(new BloxResponse(undefined, 'Database error. Try again later.'));
      return;
    }
  }

  res.json(new BloxResponse(cache));
});

router.get('/refresh', async (req: Request, res: Response): Promise<void> => {
   cacheLastRefreshed = Date.now();
   try {
      await calculateLeaderboard();
   } catch(e) {
      res.status(500);
      res.json(new BloxResponse(undefined, 'Database error. Try again later.'));
      return;
   }
 
   res.json(new BloxResponse(cache));
 });

router.get('/:user', async (req: Request, res: Response): Promise<void> => {
  res.status(501);
  res.send(new BloxResponse(undefined, 'This feature is not yet available.'));
})

export default router;
