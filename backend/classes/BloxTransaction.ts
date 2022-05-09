import {ObjectId} from "mongodb";
import DatabaseWrapper from "../db/DatabaseWrapper";
import BloxBlockchain from "./BloxBlockchain";
import BloxWallet from "./BloxWallet";
import BloxUser from "./BloxUser";

type DbResponse = {
  _id: ObjectId,
  blockchain: ObjectId,
  to: ObjectId,
  from: ObjectId,
  initiator?: ObjectId,
  value: number,
  proven: boolean // Always true in virtual
}

class BloxTransaction {

  private dbResponse: DbResponse;
  private constructor(dbResponse: DbResponse) {
    this.dbResponse = dbResponse;
  }

  public static async from(id: ObjectId, db: DatabaseWrapper) {
    const collection = db.getTransactionsCollection();
    const response = await collection.findOne({_id: id});
    if(response === null) {
      throw new Error('Transaction does not exist!');
    }
    return new BloxTransaction(response as DbResponse);
  }

  public static async create(blockchain: BloxBlockchain, from: BloxWallet, to: BloxWallet, amount: number,
                             initiator: BloxUser|undefined, db: DatabaseWrapper): Promise<BloxTransaction> {
    const collection = db.getTransactionsCollection();
    const doc = {
      blockchain: blockchain.getObjectId(),
      to: to.getObjectId(),
      from: from.getObjectId(),
      value: amount,
      initiator: initiator,
      proven: false
    }
    // insertOne adds _id field
    await collection.insertOne(doc);
    return new BloxTransaction(doc as DbResponse);
  }

  public getObjectId(): ObjectId {
    return this.dbResponse._id;
  }

  public async getBlockchain(db: DatabaseWrapper) {
    return await BloxBlockchain.from(this.dbResponse.blockchain, db);
  }

  public async getSender(db: DatabaseWrapper) {
    return await BloxWallet.from(this.dbResponse.from, db);
  }

  public async getReceiver(db: DatabaseWrapper) {
    return await BloxWallet.from(this.dbResponse.to, db);
  }

  public async getInitiator(db: DatabaseWrapper) {
    if(this.dbResponse.initiator === undefined) {
      return undefined;
    }
    return await BloxUser.from(this.dbResponse.initiator, db);
  }

  public getValue() {
    return this.dbResponse.value;
  }

  public isProven() {
    return this.dbResponse.proven;
  }

  public async fulfill(db: DatabaseWrapper) {
    const blockchain = await this.getBlockchain(db);
    const exchangeRate = await blockchain.getExchangeRate();
    const sender = await this.getSender(db);
    const receiver = await this.getReceiver(db);

    const usdExchange = await BloxBlockchain.from("USD", db);
    const senderNewUsdBalance = sender.getBalance(usdExchange) + exchangeRate * this.getValue();
    const receiverNewUsdBalance = receiver.getBalance(usdExchange) - exchangeRate * this.getValue();
    const senderNewCryptoBalance = sender.getBalance(blockchain) - this.getValue();
    const receiverNewCryptoBalance = receiver.getBalance(blockchain) + this.getValue();

    if(senderNewCryptoBalance < 0 || senderNewUsdBalance < 0 || receiverNewUsdBalance < 0 || receiverNewCryptoBalance < 0) {
      throw new Error('Illegal trade. This would put someone in debt.');
    }

    await sender.setBalance(usdExchange, senderNewUsdBalance, db);
    await sender.setBalance(blockchain, senderNewCryptoBalance, db);
    await receiver.setBalance(usdExchange, receiverNewUsdBalance, db);
    await receiver.setBalance(blockchain, receiverNewCryptoBalance, db);
  }

  public async setProven(proven: boolean, db: DatabaseWrapper): Promise<void> {
    const collection = db.getTransactionsCollection();
    await collection.updateOne({_id: this.dbResponse._id}, {$set: {proven: proven}})
  }
}

export default BloxTransaction;
