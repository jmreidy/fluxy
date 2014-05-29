/** @jsx React.DOM */
var UserConstants = require('../constants/UserConstants');
var Flux = require('../../../index');

module.exports = Flux.createStore({
  getInitialState: function () {
    return {
      user: null,
    };
  },

  actions: {
    'handleAdminLogin': [UserConstants.ADMIN_LOGIN_COMPLETED, function (payload) {
      this.set('user', payload.user);
    }]
  },

  loggedIn: function () {
    return this.get('user');
  }
});
