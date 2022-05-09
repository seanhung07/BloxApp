import axios from "axios";
import express from 'express'
import BloxResponse from "../classes/BloxResponse";
const router = express.Router();

router.get('/', async function(req, res) {
  const apiKey = process.env.NEWS_KEY
  const q = "crypto%20AND%20cryptocurrency" // url encoded to search for multiple terms
  await axios.get(`https://newsapi.org/v2/everything?q=${q}&sortBy=popularity&pageSize=100&apiKey=${apiKey}`)
    .then((response : any) => {
      res.send(new BloxResponse(response.data.articles));
    })
    .catch((error : any) =>{
      console.log(error)
      res.status(502);
      res.send(new BloxResponse(undefined, 'Bad response from news API'))
    })
});

export default router;
