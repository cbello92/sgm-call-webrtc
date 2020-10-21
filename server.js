const express = require('express');
const socketIO = require("socket.io");
const app = express();
const cors = require('cors');
const path = require('path');
// const routes = require('./routes/main');

const http = require('http');
let server = http.createServer(app);
// const fs = require('fs');
// require("dotenv").config();
require('./config/config');

app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.use(cors());
// app.use(routes);

module.exports.io = socketIO(server);

require('./sockets/socket');

app.get('/api/status', (req, res) => {
    res.status(200).send('SGM CALL WEBRTC ONLINE');
});

server.listen(process.env.PORT, () => {
    console.log(`Server is running now in port ${process.env.PORT}`);
});

module.exports.app = server;