import {Collection, Db, MongoClient} from "mongodb";
import BloxUser from "../classes/BloxUser";
import BloxDbClosedError from "../classes/errors/BloxDbClosedError";

class DatabaseWrapper {

  private client: MongoClient
  private connected: boolean = false;

  public constructor() {
    if(!process.env.MONGO_URL) {
      throw new Error('MONGO_URL environment variable is not set!');
    }
    this.client = new MongoClient(process.env.MONGO_URL);

  }

  public getDatabase(): Db {
    if(!this.connected) {
      throw new BloxDbClosedError();
    }
    return this.client.db('Blox');
  }

  public getUsersCollection(): Collection {
    if(!this.connected) {
      throw new BloxDbClosedError();
    }
    return this.getDatabase().collection('users');
  }

  public getWalletsCollection(): Collection {
    if(!this.connected) {
      throw new BloxDbClosedError();
    }
    return this.getDatabase().collection('wallets');
  }

  public getClassroomsCollection(): Collection {
    if(!this.connected) {
      throw new BloxDbClosedError();
    }
    return this.getDatabase().collection('classrooms');
  }

  public getBlockchainsCollection(): Collection {
    if(!this.connected) {
      throw new BloxDbClosedError();
    }
    return this.getDatabase().collection('blockchains');
  }

  public getTransactionsCollection(): Collection {
    if(!this.connected) {
      throw new BloxDbClosedError();
    }
    return this.getDatabase().collection('transactions');
  }

  public getSessionsCollection(): Collection {
    if(!this.connected) {
      throw new BloxDbClosedError();
    }
    return this.getDatabase().collection('sessions');
  }

  public async createUserIfNotExists(samlId: string): Promise<BloxUser> {
    if(!this.connected) {
      throw new BloxDbClosedError();
    }
    return BloxUser.createIfNotExists(samlId, this);
  }

  public async getUser(samlId: string): Promise<BloxUser> {
    if(!this.connected) {
      throw new BloxDbClosedError();
    }
    return BloxUser.from(samlId, this);
  }

  public async connect(): Promise<DatabaseWrapper> {
    await this.client.connect();
    this.connected = true;
    return this;
  }

  public async close(): Promise<DatabaseWrapper> {
    await this.client.close();
    this.connected = false;
    return this;
  }

  public get isConnected() {
    return this.connected;
  }
}

export default DatabaseWrapper;
