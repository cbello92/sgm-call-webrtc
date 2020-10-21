const { io } = require('../server');
const { usersConnected } = require('./users-connected');

io.on('connection', (client) => {

    usersConnected(client)
});