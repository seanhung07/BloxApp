import DatabaseWrapper from "../db/DatabaseWrapper";
import {ObjectId} from "mongodb";
import BloxSession from "./BloxSession";
import BloxBlockchain from "./BloxBlockchain";

type DbResponse = {
  _id: ObjectId,
  id: string,
  firstName?: string,
  lastName?: string,
  created?: Date,
  type?: 'Personal'|'Student'|'Instructor'
  following?: ObjectId[],
  public?: boolean
}

class BloxUser {

  private dbResponse: DbResponse;

  private constructor(dbResponse: DbResponse) {
    this.dbResponse = dbResponse;
  }

  public static async from(samlId: string, db: DatabaseWrapper): Promise<BloxUser>;
  public static async from(id: ObjectId, db: DatabaseWrapper): Promise<BloxUser>;
  public static async from(id: string|ObjectId, db: DatabaseWrapper): Promise<BloxUser> {
    const collection = db.getUsersCollection();
    let user;
    if (id instanceof ObjectId) {
      user =  await collection.findOne({_id: id});
    } else {
      user = await collection.findOne({id: id});
    }
    if(user === null) {
      throw new Error('User does not exist!');
    }
    return new BloxUser(user as DbResponse);
  }

  public static async createIfNotExists(samlId: string, db: DatabaseWrapper): Promise<BloxUser> {
    const collection = db.getUsersCollection();
    const user = await collection.findOne({id: samlId});

    if(user === null) {
      const doc = {id: samlId, created: new Date()};
      await collection.insertOne(doc);
      // _id is added by insertOne().
      return new BloxUser(doc as DbResponse);
    } else {
      return new BloxUser(user as DbResponse);
    }
  }

  public async createSession(db: DatabaseWrapper): Promise<BloxSession> {
    return await BloxSession.createForUser(this, db);
  }

  public getAccountId(): string {
    return this.dbResponse.id;
  }

  public getObjectId(): ObjectId {
    return this.dbResponse._id;
  }

  public getFirstName(): string|undefined {
    return this.dbResponse.firstName;
  }

  public getLastName(): string|undefined {
    return this.dbResponse.lastName;
  }

  public async setFirstName(newFirstName: string, db: DatabaseWrapper): Promise<void> {
    const collection = db.getUsersCollection();
    await collection.updateOne({_id: this.dbResponse._id}, {$set: {firstName: newFirstName}});
  }

  public async setLastName(newLastName: string, db: DatabaseWrapper): Promise<void> {
    const collection = db.getUsersCollection();
    await collection.updateOne({_id: this.dbResponse._id}, {$set: {lastName: newLastName}});
  }

  public isAccountPublic(): boolean {
    return this.dbResponse.public ?? true;
  }

  public async setAccountPublic(newValue: boolean, db: DatabaseWrapper): Promise<void> {
    const collection = db.getUsersCollection();
    await collection.updateOne({_id: this.dbResponse._id}, {$set: {public: newValue}});
  }

  public getAccountType(): string {
    return this.dbResponse.type || 'Personal';
  }

  public async setAccountType(accountType: 'Personal'|'Instructor'|'Student', db: DatabaseWrapper): Promise<void> {
    const collection = db.getUsersCollection();
    await collection.updateOne({_id: this.dbResponse._id}, {$set: {type: accountType}});
  }

  public async delete(db: DatabaseWrapper): Promise<void> {
    const collection = db.getUsersCollection();
    await collection.deleteOne({_id: this.dbResponse._id});
  }

  public async getFollowing(db: DatabaseWrapper): Promise<BloxBlockchain[]> {
    if(this.dbResponse.following === undefined) {
      return []
    }
    const array: BloxBlockchain[] = [];
    for(let i = 0; i < this.dbResponse.following.length; i++) {
      try {
        array.push(await BloxBlockchain.from(this.dbResponse.following[i], db));
      } catch(e) {
        console.error(e);
      }
    }
    return array;
  }

  public async follow(blockchain: BloxBlockchain, db: DatabaseWrapper): Promise<void> {
    if(this.dbResponse.following && this.dbResponse.following.map((e) => e.toHexString()).includes(blockchain.getObjectId().toHexString())) {
      return;
    }
    const collection = db.getUsersCollection();
    await collection.updateOne({_id: this.dbResponse._id}, {$push: { following: blockchain.getObjectId()}});
  }

  public async unfollow(blockchain: BloxBlockchain, db: DatabaseWrapper): Promise<void> {
    const collection = db.getUsersCollection();
    await collection.updateOne({_id: this.dbResponse._id}, {$pull: { following: blockchain.getObjectId()}});
  }
}

export default BloxUser;
