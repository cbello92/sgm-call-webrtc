class UserConnected {
    constructor() {
        this.users = [];
    }

    setUsersConnected(user, sid) {
        let userConnected = { ...user, 'sid': sid };
        this.users.push(userConnected)

        return this.getUsersConnectedByMunicipality(userConnected.municipality);
    }

    getUserById (sid) {
        return this.users.find(user => user.sid === sid);
    }

    setUsersDisconnected (sid) {
        let userDisconnect = this.getUserById(sid);
        this.users = this.users.filter(user => user.sid !== sid);
        return userDisconnect;
    }

    getUsersConnected () {
        return this.users;
    }

    getUsersConnectedByMunicipality (municipality) {
        return this.users.filter(user => user.municipality === municipality);
    }


    getUsersConnectedByMetting (mettingId) {
        return this.users.filter(user => user.mettingId === mettingId);
    }
}

module.exports = {
    UserConnected
}