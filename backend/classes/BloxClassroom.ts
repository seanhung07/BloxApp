import {ObjectId} from "mongodb";
import DatabaseWrapper from "../db/DatabaseWrapper";
import BloxUser from "./BloxUser";
import BloxWallet from "./BloxWallet";
import {randomBytes} from "crypto";

type DbResponse = {
  _id: ObjectId,
  name: string,
  codes?: string[],
  admins: ObjectId[],
  students?: ObjectId[],
  autowallet: ObjectId
}

class BloxClassroom {

  private dbResponse: DbResponse;
  private constructor(dbResponse: DbResponse) {
    this.dbResponse = dbResponse;
  }

  public static async from(id: ObjectId, db: DatabaseWrapper): Promise<BloxClassroom> {
    const collection = db.getClassroomsCollection();
    const response = await collection.findOne({_id: id});
    if(response === null) {
      throw new Error('Classroom does not exist!');
    }
    return new BloxClassroom(response as DbResponse);
  }

  public static async findFromCode(code: string, db: DatabaseWrapper): Promise<BloxClassroom> {
    const collection = db.getClassroomsCollection();
    const response = await collection.findOne({codes: code});
    if(response === null) {
      throw new Error('Classroom does not exist!');
    }
    return new BloxClassroom(response as DbResponse);
  }

  public static async findUsersClassrooms(user: BloxUser, db: DatabaseWrapper): Promise<BloxClassroom[]> {
    const collection = db.getClassroomsCollection();
    const responses = await collection.find({ $or: [
        { students: user.getObjectId() },
        { admins: user.getObjectId() }
      ] }).toArray();
    const classroomArray: BloxClassroom[] = [];
    for(const dbResponse of responses) {
      classroomArray.push(new BloxClassroom(dbResponse as DbResponse))
    }
    return classroomArray;
  }

  public static async create(owner: BloxUser, name: string, autoWallet: BloxWallet,
                             db: DatabaseWrapper): Promise<BloxClassroom> {
    const collection = db.getClassroomsCollection();
    const doc = {
      name: name,
      admins: [ owner.getObjectId() ],
      autowallet: autoWallet.getObjectId()
    };
    await collection.insertOne(doc);
    return new BloxClassroom(doc as DbResponse);
  }

  public getObjectId(): ObjectId {
    return this.dbResponse._id;
  }

  public getName(): string {
    return this.dbResponse.name;
  }

  public async setName(name: string, db: DatabaseWrapper): Promise<void> {
    const collection = db.getClassroomsCollection();
    await collection.updateOne({_id: this.dbResponse._id}, {$set: { name: name}})
  }
  public async setAutoWallet(wallet: BloxWallet, db: DatabaseWrapper): Promise<void> {
    const collection = db.getClassroomsCollection();
    await collection.updateOne({_id: this.dbResponse._id}, {$set: { autowallet: wallet.getObjectId()}})
  }

  public getCodes(): string[] {
    return this.dbResponse.codes || [];
  }

  public async generateCode(db: DatabaseWrapper): Promise<string> {
    const collection = db.getClassroomsCollection();
    let code;
    let tries = 0;
    const maxTries = 20;
    try {
      do {
        code = randomBytes(6).toString('hex');
      } while(await BloxClassroom.findFromCode(code, db) === null && tries++ < maxTries);
    } catch(ignored) {}
    if(tries >= maxTries) {
      throw new Error('Unable to generate unique code!');
    }
    await collection.updateOne({_id: this.dbResponse._id}, {$push: { codes: code}})
    return code as string;
  }

  public async getAdmins(db: DatabaseWrapper): Promise<BloxUser[]> {
    const adminIds = this.dbResponse.admins;
    const promises: Promise<void>[] = [];
    const adminObjs: BloxUser[] = [];

    for(let i = 0; i < adminIds.length; i++) {
      promises.push((async () => {
        adminObjs[i] = await BloxUser.from(adminIds[i], db);
      })())
    }

    await Promise.all(promises);
    return adminObjs;
  }

  public async getStudents(db: DatabaseWrapper): Promise<BloxUser[]> {
    const studentIds = this.dbResponse.students || [];
    const promises: Promise<void>[] = [];
    const studentObjs: BloxUser[] = [];

    for(let i = 0; i < studentIds.length; i++) {
      promises.push((async () => {
        studentObjs[i] = await BloxUser.from(studentIds[i], db);
      })())
    }

    await Promise.all(promises);
    return studentObjs;
  }


  public async addStudent(user: BloxUser, db: DatabaseWrapper): Promise<void> {
    const currentStudents = this.dbResponse.students || [];
    if(currentStudents.map(e => e.toHexString()).includes(user.getObjectId().toHexString())) {
      return;
    }
    const collection = db.getClassroomsCollection();
    await collection.updateOne({ _id: this.dbResponse._id },
      { $push: { students: user.getObjectId() } });
  }

  public async removeStudent(user: BloxUser, db: DatabaseWrapper): Promise<void> {
    const collection = db.getClassroomsCollection();
    await collection.updateOne({ _id: this.dbResponse._id },
      { $pull: { students: user.getObjectId() } });
  }

  public async addAdmin(user: BloxUser, db: DatabaseWrapper): Promise<void> {
    const currentAdmins = this.dbResponse.admins || [];
    if(currentAdmins.map(e => e.toHexString()).includes(user.getObjectId().toHexString())) {
      return;
    }
    const collection = db.getClassroomsCollection();
    await collection.updateOne({ _id: this.dbResponse._id },
      { $push: { admins: user.getObjectId() } });
  }

  public async removeAdmin(user: BloxUser, db: DatabaseWrapper): Promise<void> {
    const collection = db.getClassroomsCollection();
    await collection.updateOne({ _id: this.dbResponse._id },
      { $pull: { admins: user.getObjectId() } });
  }


  public async getAutoWallet(db: DatabaseWrapper): Promise<BloxWallet|undefined> {
    if(this.dbResponse.autowallet === undefined) {
      return undefined;
    }
    return BloxWallet.from(this.dbResponse.autowallet, db);
  }

  public hasMember(account: BloxUser): boolean {
    return this.isAdmin(account) || this.isStudent(account);
  }

  public isAdmin(account: BloxUser): boolean {
    return this.dbResponse.admins
      .map((e) => e.toHexString())
      .includes(account.getObjectId().toHexString()) ?? false;
  }

  public isStudent(account: BloxUser): boolean {
    return this.dbResponse.students
          ?.map((e) => e.toHexString())
          .includes(account.getObjectId().toHexString()) ?? false;
  }

  public async delete(db: DatabaseWrapper): Promise<void> {
    const collection = db.getClassroomsCollection();
    await collection.deleteOne({_id: this.dbResponse._id});
  }
}

export default BloxClassroom

