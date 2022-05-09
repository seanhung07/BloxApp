import BloxUser from "./BloxUser";
import DatabaseWrapper from "../db/DatabaseWrapper";
import {randomBytes} from "crypto";
import {ObjectId} from "mongodb";

type DbResponse = {
  _id: ObjectId,
  for: ObjectId,
  token: string,
  created: Date,
  useragent?: string,
  ip?: string
}

class BloxSession {

  private dbResponse: DbResponse
  private constructor(dbResponse: DbResponse) {
    this.dbResponse = dbResponse;
  }

  public static async createForUser(user: BloxUser, db: DatabaseWrapper): Promise<BloxSession> {
    const doc = {
      for: user.getObjectId(),
      token: randomBytes(48).toString('hex'),
      created: new Date()
    }
    await db.getSessionsCollection().insertOne(doc);
    // _id is added by insertOne()
    return new BloxSession(doc as DbResponse);
  }

  public getToken(): string {
    return this.dbResponse.token;
  }

  public getObjectId() {
    return this.dbResponse._id;
  }
}

export default BloxSession;
