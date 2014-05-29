var UserConstants = require('../constants/UserConstants');
var loginService = require("../services/loginService");

var Flux = require('../../../index');

module.exports = Flux.createActions({
  login: function (username, password) {
    var self = this;
    self.dispatchAction(UserConstants.ADMIN_LOGIN, {username: username});

    loginService.login(username, password)
      .then(function (user) {
        self.dispatchAction(UserConstants.ADMIN_LOGIN_COMPLETED, {user: user});
      }.bind(this))
      .catch(function (err) {
        self.dispatchAction(UserConstants.ADMIN_LOGIN_FAILED, {error: err});
      }.bind(this));
  }
});
