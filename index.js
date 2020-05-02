'use strict';
const http = require('http');
const redis = require('redis');
const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");

//ports
const REDISHOST = process.env.REDISHOST || 'localhost';
const REDISPORT = process.env.REDISPORT || 6379;
// const port = process.env.PORT || 5000;

const redis_client = redis.createClient(REDISPORT, REDISHOST);
redis_client.on('error', (err) => console.error('ERR:REDIS:', err));

//configure express server
const app = express();

//Body Parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// app.get("/api/", (req, res) => res.send ('api working'))
app.get("/api/playerStats/:apikey&:pid", async (req, res) => {
  try {
    const { pid, apikey } = req.params;
    const url = `https://cricapi.com/api/playerStats?${apikey}&${pid}`
    const playerInfo = await axios.get(url);

    //get data from response
    const playerInfoData = playerInfo.data;

    return res.json(playerInfoData);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
});

app.listen(8080);
