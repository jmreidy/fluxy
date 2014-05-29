/** @jsx React.DOM */
var ReactRouter = require('react-router');

var UserConstants = require('../constants/UserConstants');
var UserStore = require('./UserStore');

var Flux = require('../../../index');

module.exports = Flux.createStore({
  actions: {
    handleLoginComplete: [
      UserConstants.ADMIN_LOGIN_COMPLETED,
      {waitFor: [UserStore]},
      function (user) {
        ReactRouter.transitionTo('list', {});
      }
    ]
  }
});
