const { NODE_ENV } = require('../active.env');
const path = require('path');

const envs = {
    prod: {
        PORT: 5001
    },
    dev: {
        PORT: 6002
    }
}

exports.deployment = envs[NODE_ENV];