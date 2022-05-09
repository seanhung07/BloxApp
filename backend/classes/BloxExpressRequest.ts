import {Request} from 'express';
import BloxUser from "./BloxUser";
export interface BloxExpressRequest extends Request {
  account?: BloxUser
}
