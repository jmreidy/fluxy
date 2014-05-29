/** @jsx React.DOM */
var React = require('react');
var UserStore = require('../stores/UserStore');
var HistoryActions = require('../actions/HistoryActions');
var HistoryStore = require('../stores/HistoryStore');

var AuthenticatedRoute = {
  statics: {
    lastInfo: undefined
  },

  authenticated: function () {
    return this.loggedIn;
  },

  componentWillMount: function () {
    this.loggedIn = UserStore.loggedIn();
    if (!this.loggedIn) {
      this.render = function () { return <span /> };
    }
  },
  componentDidMount: function () {
    if (!this.loggedIn) {
      HistoryActions.navigateTo('login', {});
    }
  }
};

module.exports = AuthenticatedRoute;
