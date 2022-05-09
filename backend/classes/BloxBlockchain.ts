import {ObjectId} from "mongodb";
import DatabaseWrapper from "../db/DatabaseWrapper";
import BloxWallet from "./BloxWallet";
import axios from "axios";

type DbResponse = {
  _id: ObjectId,
  ticker: string,
  type: "simple", // TODO virtual
  exchange: ObjectId,
  // admins: ObjectId[] // Virtual feature
  consensus_algorithm?: string
  // classroom?: ObjectId // Virtual feature
}

abstract class BloxBlockchain {

  protected dbResponse: DbResponse;
  protected constructor(dbResponse: DbResponse) {
    this.dbResponse = dbResponse;
  }

  public static async from(ticker: string, db: DatabaseWrapper): Promise<BloxBlockchain>;
  public static async from(id: ObjectId, db: DatabaseWrapper): Promise<BloxBlockchain>;
  public static async from(id: ObjectId|string, db: DatabaseWrapper): Promise<BloxBlockchain> {
    const collection = db.getBlockchainsCollection();
    let response;
    if(id instanceof ObjectId) {
      response = await collection.findOne({_id: id});
    } else {
      response = await collection.findOne({ticker: id});
    }
    if(response === null) {
      throw new Error('Blockchain does not exist!');
    }
    if(response.type === "simple") {
      return new BloxSimpleBlockchain(response as DbResponse);
    } else {
      throw new Error('Blockchain ' + response._id + ' is an unknown type (' + response.type + ')');
    }
  }

  public static async getAll(db: DatabaseWrapper): Promise<BloxBlockchain[]> {
    const collection = db.getBlockchainsCollection();
    const blockchainsRaw = await collection.find({}).toArray();
    const blockchains: BloxBlockchain[] = [];
    for(const blockchainRaw of blockchainsRaw) {
      if(blockchainRaw.type === "simple") {
        blockchains.push(new BloxSimpleBlockchain(blockchainRaw as DbResponse));
      } else {
        throw new Error('Blockchain ' + blockchainRaw._id + ' is an unknown type (' + blockchainRaw.type + ')');
      }
    }
    return blockchains;
  }

  public getObjectId(): ObjectId {
    return this.dbResponse._id;
  }

  public getTicker(): string {
    return this.dbResponse.ticker;
  }

  public getType(): string {
    return this.dbResponse.type;
  }

  public async getExchange(db: DatabaseWrapper): Promise<BloxWallet> {
    return BloxWallet.from(this.dbResponse.exchange, db);
  }

  public hasConsensusAlgorithm(): boolean {
    return this.dbResponse.consensus_algorithm !== undefined;
  }

  /**
   * @returns Exchange rate as a ratio of 1 USD to 1 unit of currency on this blockchain.
   */
  abstract getExchangeRate(): Promise<number>;
}


class BloxSimpleBlockchain extends BloxBlockchain {

  public async getExchangeRate(): Promise<number> {
    const symbol = this.getTicker() + 'USDC';
    const apiResponse = await axios.get(`https://api.binance.com/api/v3/trades?symbol=${symbol}&limit=1`);
    return apiResponse.data[0].price
  }
}

export {BloxSimpleBlockchain, BloxBlockchain};
export default BloxBlockchain;
