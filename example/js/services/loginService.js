var Promise = require('bluebird');
//dummy login service
module.exports = {
  login: function (username, password) {
    var token = Promise.defer();
    token.resolve({username: username, password: password});
    return token.promise;
  }
};
