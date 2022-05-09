import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {catchError, EMPTY} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private httpClient: HttpClient) { }

  private async getProtectedEndpoint(url: string, options?: any): Promise<any> {
    if(options === undefined) {
      options = {}
    }
    return new Promise((resolve, reject) => {
      let reqTimer = setTimeout(() => {
        this.httpClient.get(url, {
          headers: {
            Authorization: 'Bearer ' + window.localStorage.getItem('blox-firebase-token'),
            ...options
          }
        }).pipe(catchError((err) => {
          if (err.error instanceof ErrorEvent) {
            reject(err.error);
          } else {
            reject(err);
          }
          return EMPTY;
        })).subscribe((value) => {
          clearTimeout(timeoutTimer);
          resolve(value);
        })
      }, 0);
      let timeoutTimer = setTimeout(() => {
        clearTimeout(reqTimer);
        reject(new Error('Request timed out'));
      }, 30000);
    });
  }

  private async putProtectedEndpoint(url: string, body: any, options?: any): Promise<any> {
    if(options === undefined) {
      options = {}
    }
    return new Promise((resolve, reject) => {
      let reqTimer = setTimeout(() => {
        this.httpClient.put(url, body,{
          headers: {
            Authorization: 'Bearer ' + window.localStorage.getItem('blox-firebase-token'),
            ...options
          }
        }).pipe(catchError((err) => {
          if (err.error instanceof ErrorEvent) {
            reject(err.error);
          } else {
            reject(err);
          }
          return EMPTY;
        })).subscribe((value) => {
          clearTimeout(timeoutTimer);
          resolve(value);
        })
      }, 0);
      let timeoutTimer = setTimeout(() => {
        clearTimeout(reqTimer);
        reject(new Error('Request timed out'));
      }, 30000);
    });
  }

  private async patchProtectedEndpoint(url: string, body: any, options?: any): Promise<any> {
    if(options === undefined) {
      options = {}
    }
    return new Promise((resolve, reject) => {
      let reqTimer = setTimeout(() => {
        this.httpClient.patch(url, body,{
          headers: {
            Authorization: 'Bearer ' + window.localStorage.getItem('blox-firebase-token'),
            ...options
          }
        }).pipe(catchError((err) => {
          if (err.error instanceof ErrorEvent) {
            reject(err.error);
          } else {
            reject(err);
          }
          return EMPTY;
        })).subscribe((value) => {
          clearTimeout(timeoutTimer);
          resolve(value);
        })
      }, 0);
      let timeoutTimer = setTimeout(() => {
        clearTimeout(reqTimer);
        reject(new Error('Request timed out'));
      }, 30000);
    });
  }

  private async postProtectedEndpoint(url: string, body: any, options?: any): Promise<any> {
    if(options === undefined) {
      options = {}
    }
    return new Promise((resolve, reject) => {
      let reqTimer = setTimeout(() => {
        this.httpClient.post(url, body,{
          headers: {
            Authorization: 'Bearer ' + window.localStorage.getItem('blox-firebase-token'),
            ...options
          }
        }).pipe(catchError((err) => {
          if (err.error instanceof ErrorEvent) {
            reject(err.error);
          } else {
            reject(err);
          }
          return EMPTY;
        })).subscribe((value) => {
          console.log(value)
          clearTimeout(timeoutTimer);
          resolve(value);
        })
      }, 0);
      let timeoutTimer = setTimeout(() => {
        clearTimeout(reqTimer);
        reject(new Error('Request timed out'));
      }, 30000);
    });
  }

  public getNews() {
    return this.httpClient.get("http://localhost:3000/api/v1/news");
  }

  public async getAccountData(): Promise<any> {
    return this.getProtectedEndpoint("http://localhost:3000/api/v1/user");
  }

  public async setAccountData(id: string, options: any): Promise<any> {
    return this.patchProtectedEndpoint("http://localhost:3000/api/v1/user/" + id, options);
  }

  public async getWallets(): Promise<any> {
    const walletResponse = await this.getProtectedEndpoint("http://localhost:3000/api/v1/wallets");
    if(walletResponse.error) {
      throw new Error(walletResponse.error);
    }
    return walletResponse.data;
  }

  public async updateWallet(address: string, body: any): Promise<any> {
    const walletResponse = await this.patchProtectedEndpoint("http://localhost:3000/api/v1/wallets/" + address, body);
    if(walletResponse.error) {
      throw new Error(walletResponse.error);
    }
    return walletResponse.data;
  }

  public async getWallet(address: string): Promise<any> {
    const walletResponse = await this.getProtectedEndpoint(`http://localhost:3000/api/v1/wallets/${address}`);
    if(walletResponse.error) {
      throw new Error(walletResponse.error);
    }
    return walletResponse.data;
  }

  public async createWallet(name: string, startingBalance: number): Promise<any> {
    if(startingBalance < 0) {
      throw new Error('Balance must be >= 0')
    }
    const walletData = await this.putProtectedEndpoint("http://localhost:3000/api/v1/wallets", undefined);
    if(walletData.error) {
      throw new Error(walletData.error);
    }
    const walletAddr = walletData.data.address;
    const updatedWallet = await this.patchProtectedEndpoint("http://localhost:3000/api/v1/wallets/" + walletAddr, {
      name: name,
      balances: {
        USD: startingBalance
      }
    });
    if(updatedWallet.error) {
      throw new Error(updatedWallet.error);
    }
    return updatedWallet.data;
  }

  public async getCrypto(){
    const cryptoResponse = await this.getProtectedEndpoint("http://localhost:3000/api/v1/crypto");
    if(cryptoResponse.error) {
      throw new Error(cryptoResponse.error);
    }
    return cryptoResponse.data;
  }

  public getLeaderNameAndBalances() {
   return this.httpClient.get("http://localhost:3000/api/v1/leaderboard");
  }

  public getLatestLeaderNameAndBalances() {
   return this.httpClient.get("http://localhost:3000/api/v1/leaderboard/refresh");
  }

  public async postTransaction(ticker: string, wallet_address: string, amount: number, action: string){
    console.log(ticker, amount, wallet_address, action);
    console.log("http://localhost:3000/api/v1/crypto/"+ticker);

    const transactionResponse = await this.postProtectedEndpoint("http://localhost:3000/api/v1/crypto/"+ticker, {
        "wallet": wallet_address,
        "action": action,
        "amount": amount
      }
    );

    if(transactionResponse.error) {
      throw new Error(transactionResponse.error);
    }
    return transactionResponse.data;
  }
}

