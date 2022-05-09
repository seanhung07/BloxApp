import express from 'express'
import BloxResponse from "../classes/BloxResponse";
import BloxBlockchain from "../classes/BloxBlockchain";
import DatabaseWrapper from "../db/DatabaseWrapper";
import {requireLoggedIn} from "../middleware/firebase";
import {BloxExpressRequest} from "../classes/BloxExpressRequest";
import BloxWallet from "../classes/BloxWallet";
import BloxTransaction from "../classes/BloxTransaction";
const router = express.Router();

router.get('/', async (req, res) => {
  const db = new DatabaseWrapper();
  await db.connect();
  const blockchains = await BloxBlockchain.getAll(db)
  await db.close();

  const blockchainsOutput = []
  for(const blockchain of blockchains) {
    if(blockchain.getTicker() === "USD") {
      // This is a special blockchain that represents USD and does not have an exchange rate or
      // central exchange wallet. This could be changed in the future by instead using a USD stablecoin.
      continue;
    }
    blockchainsOutput.push({
      _id: blockchain.getObjectId(),
      ticker: blockchain.getTicker(),
      exchangeRate: await blockchain.getExchangeRate()
    })
  }

  res.json(new BloxResponse(blockchainsOutput));
});

router.post('/:ticker', requireLoggedIn, async (req: BloxExpressRequest, res) => {
  if(!req.account) {
    res.status(401);
    res.json(new BloxResponse(undefined, 'Not logged in.'));
    return;
  }
  if(typeof req.body.wallet !== "string" ||
      !(req.body.action === "buy" || req.body.action === "sell") ||
      typeof req.body.amount !== "number" || req.body.amount <= 0) {
    res.status(400);
    res.json(new BloxResponse(undefined, 'Malformed data'));
    return;
  }

  const db = new DatabaseWrapper();
  await db.connect();

  let blockchain;
  try {
    blockchain = await BloxBlockchain.from(req.params.ticker, db);
  } catch(e) {
    await db.close();
    res.status(404);
    res.json(new BloxResponse(undefined, 'Invalid ticker'));
    return;
  }

  let wallet;
  try {
    wallet = await BloxWallet.from(req.body.wallet, db);
  } catch(e) {
    await db.close();
    res.status(404);
    res.json(new BloxResponse(undefined, 'Invalid wallet'));
    return;
  }

  if(!wallet.isMember(req.account) && !wallet.isAdmin(req.account)) {
    await db.close();
    res.status(403);
    res.json(new BloxResponse(undefined, 'Insufficient permissions'));
    return;
  }

  let transaction: BloxTransaction;
  try {
    if(req.body.action === "buy") {
      transaction = await wallet.buy(blockchain, req.body.amount, req.account, db);
    } else {
      transaction = await wallet.sell(blockchain, req.body.amount, req.account, db);
    }
    if(blockchain.getType() === "simple") {
      await transaction.fulfill(db);
      await transaction.setProven(true, db);
    }
  } catch(e) {
    await db.close();
    res.status(400);
    res.json(new BloxResponse(undefined, 'Insufficient funds'));
    return;
  }

  let responseObj = {
    _id: transaction.getObjectId(),
    blockchain: blockchain.getObjectId(),
    to: (await transaction.getReceiver(db)).getAddress(),
    from: req.body.wallet,
    initiator: req.account.getObjectId(),
    value: req.params.amount,
    proven: transaction.isProven()
  }

  await db.close();
  res.json(new BloxResponse(responseObj));
})

export default router;
