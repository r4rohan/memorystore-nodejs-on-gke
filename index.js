const redis = require('redis');
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
// ports
const REDISHOST = process.env.REDISHOST || 'localhost';
const REDISPORT = process.env.REDISPORT || 6379;
const PORT = process.env.PORT || 8080;
const VALID_TILL_SECONDS = 60;
const VERSION_NUMBER = process.env.VERSION || 4;

const redis_client = redis.createClient(REDISPORT, REDISHOST);
redis_client.on('error', (err) => console.error('ERR:REDIS:', err));

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.send(`App is running ${VERSION_NUMBER}`);
})

app.get('/api/user/:uid', function (req, res) {
  const { uid } = req.params;
  return redis_client.get(uid, function (err, val) {
    let value = val;
    let source = 'REDIS';
    if (!value) {
      source = 'NOT REDIS';
      value = getMagicNumber();
      redis_client.setex(uid, VALID_TILL_SECONDS, value);
    }
    return res.send({ source, value })
  });
});

app.get("/api/playerStats/:apikey&:pid", async (req, res) => {
  try {
    const { pid, apikey } = req.params;
    return redis_client.get(pid, async function (err, val) {
      let value = val;
      let Source = 'REDIS';
      if (!value) {
        value = await getDatafromSource(apikey, pid);
        redis_client.setex(pid, VALID_TILL_SECONDS, value);
        Source = 'API';
      }
      const data = JSON.parse(value);
      return res.send({ Source, data });

    })
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
});

function getMagicNumber() {
  return Math.floor(Math.random() * 100);
}
async function getDatafromSource(apikey, pid) {
  const url = `https://cricapi.com/api/playerStats?${apikey}&${pid}`
  const playerInfo = await axios.get(url);
  const playerInfoData = playerInfo.data;
  stringResponse = JSON.stringify(playerInfoData);
  return stringResponse
}
app.listen(PORT);
