require('dotenv').config();
import express from 'express'
import bodyParser from "body-parser"
import path from 'path'
import router from './router'

const app = express();
const port = parseInt(process.env?.port ?? "3000") || 3000;

app.use(bodyParser.json());
app.use('/api', router);

// Static serve built Angular app
app.use(express.static(path.join(__dirname, '../frontend')));
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
})

app.listen(port, () => {
	console.log('Listening on localhost:' + port);
});
