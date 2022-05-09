import {requireLoggedIn} from "../../middleware/firebase";
import {BloxExpressRequest} from "../../classes/BloxExpressRequest";
import BloxResponse from "../../classes/BloxResponse";
import express from "express";
import BloxWallet from "../../classes/BloxWallet";
import DatabaseWrapper from "../../db/DatabaseWrapper";
import BloxBlockchain from "../../classes/BloxBlockchain";
import {ObjectId} from "mongodb";
import BloxClassroom from "../../classes/BloxClassroom";
const router = express.Router();

router.get('/', requireLoggedIn, async (req: BloxExpressRequest, res) => {
  if(!req.account) {
    res.status(401);
    res.json(new BloxResponse(undefined, 'Not logged in.'));
    return;
  }

  const db = new DatabaseWrapper();
  await db.connect();
  const wallets = await BloxWallet.findFromUser(req.account, db);
  await db.close();

  res.json(new BloxResponse(wallets.map(e => {
    return {
      _id: e.getObjectId(),
      address: e.getAddress(),
      name: e.getName()
    }
  })))
});

router.put('/', requireLoggedIn, async (req: BloxExpressRequest, res) => {
  if(!req.account) {
    res.status(401);
    res.json(new BloxResponse(undefined, 'Not logged in.'));
    return;
  }

  const db = new DatabaseWrapper();
  await db.connect();
  const wallet = await BloxWallet.create(db);
  await wallet.addAdmin(req.account, db);
  await db.close();

  res.json(new BloxResponse({
    _id: wallet.getObjectId(),
    address: wallet.getAddress()
  }));
});

router.get('/:address', requireLoggedIn, async (req: BloxExpressRequest, res) => {
  if(!req.account) {
    res.status(401);
    res.json(new BloxResponse(undefined, 'Not logged in.'));
    return;
  }

  const db = new DatabaseWrapper();
  await db.connect();
  let wallet;
  try {
    wallet = await BloxWallet.from(req.params.address, db);
  } catch(e) {
    await db.close();
    res.status(404);
    res.json(new BloxResponse(undefined, 'That wallet does not exist'));
    return;
  }
  const adminIds: string[] = (await wallet.getAdmins(db)).map(e => e.getObjectId().toHexString())
  const memberIds: string[] = (await wallet.getMembers(db)).map(e => e.getObjectId().toHexString())
  await db.close();

  res.json(new BloxResponse({
    _id: wallet.getObjectId(),
    address: wallet.getAddress(),
    name: wallet.getName(),
    balances: wallet.getBalances(),
    admins: adminIds,
    members: memberIds
  }))
});

router.patch('/:address', requireLoggedIn, async (req: BloxExpressRequest, res) => {
  if(!req.account) {
    res.status(401);
    res.json(new BloxResponse(undefined, 'Not logged in.'));
    return;
  }

  const db = new DatabaseWrapper();
  await db.connect();
  let wallet;
  try {
    wallet = await BloxWallet.from(req.params.address, db);
  } catch(e) {
    await db.close();
    res.status(404);
    res.json(new BloxResponse(undefined, 'That wallet does not exist'));
    return;
  }

  // Only Admins can edit a wallet
  if(!wallet.isAdmin(req.account)) {
    res.status(403);
    res.json(new BloxResponse(undefined, 'Insufficient permissions'));
    await db.close();
    return;
  }

  // Update balances
  if(req.body.balances && typeof req.body.balances === "object" && !Array.isArray(req.body.balances)) {
    const updates: {blockchain: BloxBlockchain, value: number}[] = []
    for(const ticker in req.body.balances) {
      const balance = parseFloat(req.body.balances[ticker]);
      if(isNaN(balance)) {
        throw new Error('Invalid balance')
      }
      try {
        updates.push({blockchain: await BloxBlockchain.from(ticker, db), value: balance});
      } catch(e) {
        await db.close();
        res.status(404);
        res.json(new BloxResponse(undefined, 'Blockchain ' + ticker + ' does not exist'));
        return;
      }
    }

    for(const update of updates) {
      await wallet.setBalance(update.blockchain, update.value, db);
    }
  }

  // Set classroom if the user is an admin of this wallet & the classroom
  if(req.body.classroom && typeof req.body.classroom === "string") {
    let classroomId;
    try {
      classroomId = new ObjectId(req.body.classroom);
    } catch(e) {
      res.status(400);
      res.json(new BloxResponse(undefined, 'Invalid classroom ID'));
      await db.close();
      return;
    }
    let classroom;
    try {
      classroom = await BloxClassroom.from(classroomId, db);
    } catch(e) {
      res.status(404);
      res.json(new BloxResponse(undefined, 'That classroom does not exist'));
      await db.close();
      return;
    }

    if(!classroom.isAdmin(req.account)) {
      res.status(403);
      res.json(new BloxResponse(undefined, 'You are not an admin of that classroom'));
      await db.close();
      return;
    }

    await wallet.setClassroom(classroom, db);
  }

  // Update name
  if(req.body.name && typeof req.body.name === "string") {
    await wallet.setName(req.body.name, db);
  }

  await db.close();
  res.json(new BloxResponse(undefined));
});

router.delete('/:address', requireLoggedIn, async (req: BloxExpressRequest, res) => {
  if(!req.account) {
    res.status(401);
    res.json(new BloxResponse(undefined, 'Not logged in.'));
    return;
  }

  const db = new DatabaseWrapper();
  await db.connect();
  let wallet;
  try {
    wallet = await BloxWallet.from(req.params.address, db);
  } catch(e) {
    await db.close();
    res.status(404);
    res.json(new BloxResponse(undefined, 'That wallet does not exist'));
    return;
  }

  await wallet.removeAdmin(req.account, db);
  await wallet.removeMember(req.account, db);

  await db.close();
  res.json(new BloxResponse(undefined));
});




export default router;
