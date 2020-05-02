const redis = require('redis');
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

// ports
const REDISHOST = process.env.REDISHOST || 'localhost';
const REDISPORT = process.env.REDISPORT || 6379;
const PORT = process.env.PORT || 8080;

const redis_client = redis.createClient(REDISPORT, REDISHOST);
redis_client.on('error', (err) => console.error('ERR:REDIS:', err));

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', function(req,res){
  res.send("ROOT of app");
})

app.get('/api', function(req,res){
  res.send("API is working");
})

app.get('/api/env', function(req,res){
  res.send({
    REDISHOST,
    REDISPORT,
    PORT
  });
})

app.get('/api/user/:uid', function (req, res) {
  const { uid } = req.params;
  return redis_client.get(uid, function (err, val) {
    let value = val;
    let isNew = false;
    if (!value) {
      isNew = true;
      value = Math.floor(Math.random() * 100);
      redis_client.setex(uid, 60, value);
    }
    return res.send({ value, isNew })
  });
});

app.get("/type/:pid", async (req, res) => {
  try {
    const { pid } = req.params;
    return redis_client.get(pid, async function (err, val) {
      let value = val;
      let Source = 'REDIS';
      if (!value) {
        value = await getDatafromSource(pid);
        redis_client.setex(pid, 60, value);
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

async function getDatafromSource(pid) {
  const url = `https://pokeapi.co/api/v2/type/${pid}`
  const pokemonInfo = await axios.get(url);
  const pokemonInfoData = pokemonInfo.data;
  stringResponse = JSON.stringify(pokemonInfoData);
  return stringResponse
}

app.listen(PORT);
