const { UserConnected } = require('../classes/user-connected')
const userConnected = new UserConnected();

const usersConnected = (client) => {
    client.on('userConnected', (data, callback) => {
        let users = userConnected.setUsersConnected(data, client.id);

        if (data && data.municipality) {
            client.join(data.municipality);
            client.join(data.mettingId);
            client.broadcast.to(data.municipality).emit('listUsersConnectedMunicipality', users);
            client.broadcast.to(data.mettingId).emit('listUsersConnectedMetting', userConnected.getUsersConnectedByMetting(data.mettingId));

            callback(users);
        }

    });

    client.on('disconnect', () => {
        let userDisconnect = userConnected.setUsersDisconnected(client.id);

        if (userDisconnect) {
            client.broadcast.to(userDisconnect.municipality).emit('userDisconnectedMunicipality', userDisconnect);
            client.broadcast.to(userDisconnect.mettingId).emit('userDisconnectedMetting', userDisconnect);

            let users = userConnected.getUsersConnectedByMunicipality(userDisconnect.municipality);

            client.broadcast.to(userDisconnect.municipality).emit('listUsersConnectedMunicipality', users);
            client.broadcast.to(userDisconnect.municipality).emit('listUsersConnectedMetting', userConnected.getUsersConnectedByMetting(userDisconnect.mettingId));
        }
    });

    client.on("call-user", (data) => {

        let userFrom = userConnected.getUserById(client.id);
        let userTo = userConnected.getUserById(data.to);

        client.to(data.to).emit("call-made", {
            offer: data.offer,
            userFrom,
            userTo,
            socket: client.id
        }); 
    });

    client.on("make-answer", data => {
        client.to(data.to).emit("answer-made", {
            socket: client.id,
            answer: data.answer,
            userFrom: data.userFrom,
            userTo: data.userTo
        });
    });

    client.on("reject-call", data => {
        client.to(data.from).emit("call-rejected", {
            socket: client.id,
            userFrom: data.userFrom,
            userTo: data.userTo
        });
    });

    client.on('end-call', (data) => {
        client.to(data.to).emit("call-end", {
            message: data.message
        });
    });

}

module.exports = {
    usersConnected
}