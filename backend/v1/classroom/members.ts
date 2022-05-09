import express from 'express'
import {requireLoggedIn} from "../../middleware/firebase";
import {BloxExpressRequest} from "../../classes/BloxExpressRequest";
import BloxClassroom from "../../classes/BloxClassroom";
import BloxResponse from "../../classes/BloxResponse";
import DatabaseWrapper from "../../db/DatabaseWrapper";
import {ObjectId} from "mongodb";
import BloxUser from "../../classes/BloxUser";
import BloxWallet from "../../classes/BloxWallet";
const router = express.Router({mergeParams: true});

/**
 * Get all members of the parent router's classroom
 */
router.get('/', requireLoggedIn, async (req: BloxExpressRequest, res) => {
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
    res.status(404);
    res.json(new BloxResponse(undefined, 'That classroom does not exist'));
    return;
  }

  if(!classroom.hasMember(req.account)) {
    res.status(403);
    res.json(new BloxResponse(undefined, 'Insufficient permissions'));
    return;
  }

  if(classroom.isAdmin(req.account)) {
    res.json(new BloxResponse({
      admins: (await classroom.getAdmins(db)).map(e => e.getObjectId()),
      students: (await classroom.getStudents(db)).map(e => e.getObjectId())
    }));
  } else {
    res.json(new BloxResponse({
      admins: (await classroom.getAdmins(db)).map(e => e.getObjectId())
    }));
  }
});

/**
 * Add a member to the parent router's classroom. Body of the form: { isAdmin: boolean, user: ObjectId }
 */
router.put('/', requireLoggedIn, async (req: BloxExpressRequest, res) => {
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
    res.status(404);
    res.json(new BloxResponse(undefined, 'That classroom does not exist'));
    await db.close();
    return;
  }

  if(!classroom.isAdmin(req.account)) {
    res.status(403);
    res.json(new BloxResponse(undefined, 'Insufficient permissions'));
    await db.close();
    return;
  }

  if(typeof req.body.isAdmin !== "boolean" || typeof req.body.user !== "string") {
    res.status(400);
    res.json(new BloxResponse(undefined, 'Malformed data'));
    await db.close();
    return;
  }

  let user;
  try {
    user = await BloxUser.from(new ObjectId(req.body.user), db);
  } catch(e) {
    res.status(404);
    res.json(new BloxResponse(undefined, 'Invalid user'));
    await db.close();
    return;
  }

  if(req.body.isAdmin) {
    await classroom.addAdmin(user, db);
  } else {
    await classroom.addStudent(user, db);
  }

  await db.close();
  res.json(new BloxResponse(undefined));
});

/**
 * Get info about a specific member within the parent router's classroom
 */
router.get('/:member', requireLoggedIn, async (req: BloxExpressRequest, res) => {
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
    res.status(404);
    res.json(new BloxResponse(undefined, 'That classroom does not exist'));
    await db.close();
    return;
  }

  let member;
  try {
    member = await BloxUser.from(new ObjectId(req.params.member), db);
  } catch(e) {
    res.status(404);
    res.json(new BloxResponse(undefined, 'Invalid member'));
    await db.close();
    return;
  }

  if(!classroom.hasMember(member)) {
    res.status(404);
    res.json(new BloxResponse(undefined, 'Invalid member'));
    await db.close();
    return;
  }

  // If current user is not an admin, they should be able to get the names of the admins and that's it
  if(!classroom.isAdmin(req.account)) {
    if(!classroom.isAdmin(member)) {
      res.status(404);
      res.json(new BloxResponse(undefined, 'Invalid member'));
      await db.close();
      return;
    }
    res.json(new BloxResponse({
      _id: member.getObjectId(),
      firstName: member.getFirstName(),
      lastName: member.getLastName()
    }));
    await db.close();
  } else {
    const wallets = (await BloxWallet.findFromUserInClassroom(member, classroom, db)).map(e => {
      return {
        _id: e.getObjectId(),
        id: e.getAddress(),
        name: e.getName(),
        balances: e.getBalances()
      }
    });
    res.json(new BloxResponse({
      _id: member.getObjectId(),
      firstName: member.getFirstName(),
      lastName: member.getLastName(),
      wallets: wallets
    }));
  }
})

/**
 * Update info about a specific member within the parent router's classroom
 */
router.patch('/:member', requireLoggedIn, async (req: BloxExpressRequest, res) => {
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
    res.status(404);
    res.json(new BloxResponse(undefined, 'That classroom does not exist'));
    await db.close();
    return;
  }

  if(!classroom.isAdmin(req.account)) {
    res.status(403);
    res.json(new BloxResponse(undefined, 'Insufficient permissions'));
    await db.close();
    return;
  }

  let member;
  try {
    member = await BloxUser.from(new ObjectId(req.params.member), db);
  } catch(e) {
    res.status(404);
    res.json(new BloxResponse(undefined, 'Invalid member'));
    await db.close();
    return;
  }

  if(!classroom.hasMember(member)) {
    res.status(404);
    res.json(new BloxResponse(undefined, 'Invalid member'));
    await db.close();
    return;
  }

  if(typeof req.body.isAdmin === "boolean") {
    if(req.body.isAdmin) {
      await classroom.removeStudent(member, db);
      await classroom.addAdmin(member, db);
    } else {
      await classroom.removeAdmin(member, db);
      await classroom.addStudent(member, db);
    }
    res.json(new BloxResponse(undefined));
  } else {
    res.status(400);
    await db.close();
    res.json(new BloxResponse(undefined, 'Invalid classroom member type'));
    return;
  }
})

/**
 * Remove a specific member from the parent router's classroom
 */
router.delete('/:member', requireLoggedIn, async (req: BloxExpressRequest, res) => {
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
    res.status(404);
    res.json(new BloxResponse(undefined, 'That classroom does not exist'));
    await db.close();
    return;
  }

  if(!classroom.isAdmin(req.account)) {
    res.status(403);
    res.json(new BloxResponse(undefined, 'Insufficient permissions'));
    await db.close();
    return;
  }

  let member;
  try {
    member = await BloxUser.from(new ObjectId(req.params.member), db);
  } catch(e) {
    res.status(404);
    res.json(new BloxResponse(undefined, 'Invalid member'));
    await db.close();
    return;
  }

  if(!classroom.hasMember(member)) {
    res.status(404);
    res.json(new BloxResponse(undefined, 'Invalid member'));
    await db.close();
    return;
  }

  await classroom.removeStudent(member, db);
  await classroom.removeAdmin(member, db);
  await db.close();
  res.json(new BloxResponse(undefined));
});


export default router;
