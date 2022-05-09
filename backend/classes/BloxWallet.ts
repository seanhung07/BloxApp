import {ObjectId} from "mongodb";
import BloxUser from "./BloxUser";
import DatabaseWrapper from "../db/DatabaseWrapper";
import BloxClassroom from "./BloxClassroom";
import * as crypto from "crypto";
import BloxBlockchain from "./BloxBlockchain";
import BloxTransaction from "./BloxTransaction";

type DbResponse = {
  _id: ObjectId,
  address: string,
  name?: string,
  admins?: ObjectId[],
  members?: ObjectId[],
  balance: {[key: string]: number}, // Key = ObjectId reference
  classroom?: ObjectId
}

class BloxWallet {

  private dbResponse: DbResponse;

  private constructor(dbResponse: DbResponse) {
    this.dbResponse = dbResponse;
  }

  public static async from(address: string, db: DatabaseWrapper): Promise<BloxWallet>;
  public static async from(id: ObjectId, db: DatabaseWrapper): Promise<BloxWallet>;
  public static async from(id: string|ObjectId, db: DatabaseWrapper): Promise<BloxWallet> {
    const collection = db.getWalletsCollection();
    let response;
    if(id instanceof ObjectId) {
      response = await collection.findOne({_id: id});
    } else {
      response = await collection.findOne({address: id});
    }
    if(response === null) {
      throw new Error('Wallet does not exist!');
    }
    return new BloxWallet(response as DbResponse);
  }

  public static async create(db: DatabaseWrapper): Promise<BloxWallet> {
    const collection = db.getWalletsCollection();
    let tries = 0;
    const maxTries = 10;
    while(tries++ < maxTries) {
      const addr = crypto.randomBytes(32).toString('hex');
      const response = await collection.findOne({address: addr});
      if(response !== null) {
        continue;
      }

      const doc = {
        address: addr,
        balance: {}
      }
      await collection.insertOne(doc);
      return new BloxWallet(doc as DbResponse);
    }
    throw new Error('Could not generate a unique wallet ID after 10 tries.');
  }

  public static async findFromUser(user: BloxUser, db: DatabaseWrapper): Promise<BloxWallet[]> {
    const collection = db.getWalletsCollection();
    const response = await collection.find({$or: [{admins: user.getObjectId()}, {members: user.getObjectId()}]})
      .toArray()
    const wallets: BloxWallet[] = [];
    for(const walletRaw of response) {
      wallets.push(new BloxWallet(walletRaw as DbResponse));
    }
    return wallets;
  }
  public static async findFromUserInClassroom(user: BloxUser, classroom: BloxClassroom,
                                              db: DatabaseWrapper): Promise<BloxWallet[]> {
    const collection = db.getWalletsCollection();
    const response = await collection.find({$or: [{admins: user.getObjectId(), classroom: classroom.getObjectId()},
        {members: user.getObjectId(), classroom: classroom.getObjectId()}]}).toArray()
    const wallets: BloxWallet[] = [];
    for(const walletRaw of response) {
      wallets.push(new BloxWallet(walletRaw as DbResponse));
    }
    return wallets;
  }

  public getAddress(): string|undefined {
    return this.dbResponse.address;
  }

  public getName(): string|undefined {
    return this.dbResponse.name;
  }

  public getObjectId(): ObjectId {
    return this.dbResponse._id;
  }

  public getBalances(): { [key: string]: number } {
    return this.dbResponse.balance;
  }

  public getBalance(currency: BloxBlockchain): number {
    return this.dbResponse.balance[currency.getTicker()] ?? 0;
  }

  public async setBalance(currency: BloxBlockchain, value: number, db: DatabaseWrapper): Promise<void> {
    const collection = db.getWalletsCollection();
    const newBalanceObj: any = { }
    newBalanceObj['balance.' + currency.getTicker()] = value;
    await collection.updateOne({_id: this.dbResponse._id}, {$set: newBalanceObj}, {upsert: true})
  }

  public async getMembers(db: DatabaseWrapper): Promise<BloxUser[]> {
    const memberIds = this.dbResponse.members || [];
    const promises: Promise<void>[] = [];
    const memberObjs: BloxUser[] = [];

    for(let i = 0; i < memberIds.length; i++) {
      promises.push((async () => {
        memberObjs[i] = await BloxUser.from(memberIds[i], db);
      })())
    }

    await Promise.all(promises);
    return memberObjs;
  }

  public async getAdmins(db: DatabaseWrapper): Promise<BloxUser[]> {
    const adminIds = this.dbResponse.admins || [];
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

  public isAdmin(user: BloxUser): boolean {
    return this.dbResponse.admins?.map(
      (e) => e.toHexString()
    ).includes(user.getObjectId().toHexString()) ?? false
  }

  public isMember(user: BloxUser): boolean {
    return this.dbResponse.members?.map(
      (e) => e.toHexString()
    ).includes(user.getObjectId().toHexString()) ?? false
  }

  public async getClassroom(db: DatabaseWrapper): Promise<BloxClassroom|undefined> {
    if(this.dbResponse.classroom === undefined) {
      return undefined;
    }
    return await BloxClassroom.from(this.dbResponse.classroom, db);
  }

  public async addMember(user: BloxUser, db: DatabaseWrapper): Promise<void> {
    const currentMembers = this.dbResponse.members || [];
    if(currentMembers.includes(user.getObjectId())) {
      return;
    }
    const collection = db.getWalletsCollection();
    await collection.updateOne({ _id: this.dbResponse._id },
      { $push: { members: user.getObjectId() } });
  }

  public async removeMember(user: BloxUser, db: DatabaseWrapper): Promise<void> {
    const collection = db.getWalletsCollection();
    await collection.updateOne({ _id: this.dbResponse._id },
      { $pull: { members: user.getObjectId() } });
  }

  public async addAdmin(user: BloxUser, db: DatabaseWrapper): Promise<void> {
    const currentAdmins = this.dbResponse.admins || [];
    if(currentAdmins.includes(user.getObjectId())) {
      return;
    }
    const collection = db.getWalletsCollection();
    await collection.updateOne({ _id: this.dbResponse._id },
      { $push: { admins: user.getObjectId() } });
  }

  public async removeAdmin(user: BloxUser, db: DatabaseWrapper): Promise<void> {
    const collection = db.getWalletsCollection();
    await collection.updateOne({ _id: this.dbResponse._id },
      { $pull: { admins: user.getObjectId() } });
  }

  public async setName(name: string, db: DatabaseWrapper): Promise<void> {
    const collection = db.getWalletsCollection();
    await collection.updateOne({_id: this.dbResponse._id}, {$set: {name: name}});
  }

  public async setClassroom(classroom: BloxClassroom, db: DatabaseWrapper): Promise<void> {
    const collection = db.getWalletsCollection();
    await collection.updateOne({_id: this.dbResponse._id}, {$set: {classroom: classroom.getObjectId()}});
  }

  public async sell(currency: BloxBlockchain, amount: number, initiator: BloxUser|undefined,
                    db: DatabaseWrapper): Promise<BloxTransaction> {

    const usdExchange = await BloxBlockchain.from("USD", db);
    const exchangeRate = await currency.getExchangeRate();
    const sender = this;
    const receiver = await currency.getExchange(db);
    const senderNewUsdBalance = sender.getBalance(usdExchange) + exchangeRate * amount;
    const receiverNewUsdBalance = receiver.getBalance(usdExchange) - exchangeRate * amount;
    const senderNewCryptoBalance = sender.getBalance(currency) - amount;
    const receiverNewCryptoBalance = receiver.getBalance(currency) + amount;

    if(senderNewCryptoBalance < 0 || senderNewUsdBalance < 0 || receiverNewUsdBalance < 0 || receiverNewCryptoBalance < 0) {
      throw new Error('Illegal trade. This would put someone in debt.');
    }
    return await BloxTransaction.create(currency, sender, receiver, amount, initiator, db);
  }

  public async buy(currency: BloxBlockchain, amount: number, initiator: BloxUser|undefined,
                   db: DatabaseWrapper): Promise<BloxTransaction> {

    const usdExchange = await BloxBlockchain.from("USD", db);
    const exchangeRate = await currency.getExchangeRate();
    const sender = await currency.getExchange(db);
    const receiver = this;
    const senderNewUsdBalance = sender.getBalance(usdExchange) + exchangeRate * amount;
    const receiverNewUsdBalance = receiver.getBalance(usdExchange) - exchangeRate * amount;
    const senderNewCryptoBalance = sender.getBalance(currency) - amount;
    const receiverNewCryptoBalance = receiver.getBalance(currency) + amount;

    if(senderNewCryptoBalance < 0 || senderNewUsdBalance < 0 || receiverNewUsdBalance < 0 || receiverNewCryptoBalance < 0) {
      throw new Error('Illegal trade. This would put someone in debt.');
    }
    return await BloxTransaction.create(currency, sender, receiver, amount, initiator, db);
  }
}

export default BloxWallet;
