import express from 'express';
import {requireLoggedIn} from "../../middleware/firebase";
import {BloxExpressRequest} from "../../classes/BloxExpressRequest";
import DatabaseWrapper from "../../db/DatabaseWrapper";
import BloxClassroom from "../../classes/BloxClassroom";
import BloxResponse from "../../classes/BloxResponse";
import {ObjectId} from "mongodb";
import BloxWallet from "../../classes/BloxWallet";
import MembersHandler from './members'
const router = express.Router();

/**
 * Get a list of all classrooms that you are a part of. Brief overview (name + id)
 */
router.get('/', requireLoggedIn, async (req: BloxExpressRequest, res) => {
  if(!req.account) {
    res.status(401);
    res.json(new BloxResponse(undefined, 'Not logged in.'));
    return;
  }
  const db = new DatabaseWrapper();
  await db.connect();
  const outputArr: {_id: ObjectId, name: string}[] = []
  const classroomArr = await BloxClassroom.findUsersClassrooms(req.account, db);
  for(let i = 0; i < classroomArr.length; i++) {
    outputArr.push({
      _id: classroomArr[i].getObjectId(),
      name: classroomArr[i].getName()
    })
  }
  await db.close();
  res.json(new BloxResponse(outputArr));
})

/**
 * Create a new classroom. Requires body: { name: string, wallet: string }
 */
router.put('/', requireLoggedIn, async (req: BloxExpressRequest, res) => {
  if(!req.account) {
    res.status(401);
    res.json(new BloxResponse(undefined, 'Not logged in.'));
    return;
  }
  const db = new DatabaseWrapper();
  await db.connect();

  // Find the wallet the user is trying to link to this classroom
  let wallet: BloxWallet;
  try {
    wallet = await BloxWallet.from(req.body.wallet, db);
  } catch(e) {
    await db.close();
    res.status(404);
    res.json(new BloxResponse(undefined, 'That wallet does not exist.'));
    return;
  }

  // Make sure this user is an owner of the wallet they're trying to make the auto-wallet
  if(!wallet.isAdmin(req.account)) {
    await db.close();
    res.status(403);
    res.json(new BloxResponse(undefined, 'You must be an owner of the autowallet.'));
    return;
  }

  // Create the classroom if all checks out
  const newClassroom = await BloxClassroom.create(req.account, req.body.name, wallet, db);
  await db.close();
  res.json(new BloxResponse({
    _id: newClassroom.getObjectId(),
    name: newClassroom.getName(),
    admins: [ req.account.getObjectId() ],
    autowallet: wallet.getAddress()
  }))
});

/**
 * Join a classroom with the specified code, if it is valid.
 */
router.post('/:code', requireLoggedIn, async (req: BloxExpressRequest, res) => {
  if(!req.account) {
    res.status(401);
    res.json(new BloxResponse(undefined, 'Not logged in.'));
    return;
  }
  const db = new DatabaseWrapper();
  await db.connect();
  try {
    const classroom = await BloxClassroom.findFromCode(req.params.code, db);
    if(!classroom.hasMember(req.account)) {
      await classroom.addStudent(req.account, db);
    }
    await db.close();
    res.json({
      _id: classroom.getObjectId(),
      name: classroom.getName()
    });
  } catch(e) {
    await db.close();
    res.status(404);
    res.json(new BloxResponse(undefined, 'Invalid classroom code'));
    return;
  }
});

/**
 * Get data about a specific classroom. Returns all data about the classroom which the user has access to, besides
 * the members' data.
 */
router.get('/:id', requireLoggedIn, async (req: BloxExpressRequest, res) => {
  if(!req.account) {
    res.status(401);
    res.json(new BloxResponse(undefined, 'Not logged in.'));
    return;
  }
  const db = new DatabaseWrapper();
  await db.connect();

  let classroom;
  try {
    classroom = await BloxClassroom.from(new ObjectId(req.params.id), db);
  } catch(e) {
    await db.close();
    res.status(404);
    res.json(new BloxResponse(undefined, 'That classroom does not exist'));
    return;
  }

  const responseObj: any = {
    _id: classroom.getObjectId(),
    name: classroom.getName(),
    admins: (await classroom.getAdmins(db)).map(e => e.getObjectId()),
  }
  if(classroom.isAdmin(req.account)) {
    responseObj.wallet = (await classroom.getAutoWallet(db))?.getAddress();
    responseObj.students = (await classroom.getStudents(db)).map(e => e.getObjectId());
    responseObj.codes = classroom.getCodes();
  }

  await db.close();
  res.json(new BloxResponse(responseObj));
});

router.patch('/:id', requireLoggedIn, async (req: BloxExpressRequest, res) => {
  if(!req.account) {
    res.status(401);
    res.json(new BloxResponse(undefined, 'Not logged in.'));
    return;
  }
  const db = new DatabaseWrapper();
  await db.connect();

  let classroom;
  try {
    classroom = await BloxClassroom.from(new ObjectId(req.params.id), db);
  } catch(e) {
    await db.close();
    res.status(404);
    res.json(new BloxResponse(undefined, 'That classroom does not exist'));
    return;
  }

  if(!classroom.isAdmin(req.account)) {
    res.status(403);
    res.json(new BloxResponse(undefined, "You don't have permission to edit this classroom."));
    return;
  }

  let body: any = {};
  if(req.body.generateCode) {
    body.code = await classroom.generateCode(db);
  }
  if(req.body.name) {
    await classroom.setName(req.body.name, db);
    body.name = req.body.name;
  }
  if(req.body.wallet) {
    // Find the wallet the user is trying to link to this classroom
    let wallet: BloxWallet;
    try {
      wallet = await BloxWallet.from(req.body.wallet, db);
    } catch(e) {
      await db.close();
      res.status(404);
      res.json(new BloxResponse(undefined, 'That wallet does not exist.'));
      return;
    }
    await classroom.setAutoWallet(wallet, db);
    body.wallet = wallet.getAddress();
  }
  res.json(new BloxResponse(body));
});

router.delete('/:id', requireLoggedIn, async (req: BloxExpressRequest, res) => {
  if(!req.account) {
    res.status(401);
    res.json(new BloxResponse(undefined, 'Not logged in.'));
    return;
  }
  const db = new DatabaseWrapper();
  await db.connect();

  let classroom;
  try {
    classroom = await BloxClassroom.from(new ObjectId(req.params.id), db);
  } catch(e) {
    await db.close();
    res.status(404);
    res.json(new BloxResponse(undefined, 'That classroom does not exist'));
    return;
  }

  if(!classroom.isAdmin(req.account)) {
    res.status(403);
    res.json(new BloxResponse(undefined, "You don't have permission to edit this classroom."));
    return;
  }

  await classroom.delete(db);
  await db.close();
  res.json(new BloxResponse(undefined));
});

router.use('/:id/members', MembersHandler);

export default router;
