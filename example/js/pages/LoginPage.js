/** @jsx React.DOM */
var React = require("react");
var LoginPanel = require("../components/loginPanel");
var UserActions = require("../actions/UserActions");
var UserStore = require('../stores/UserStore');

module.exports = React.createClass({
  getInitialState: function () {
    return {
      user: UserStore.get('user'),
      errMsg: ""
    };
  },
  componentWillMount: function () {
    UserStore.on('changed:user', this.handleUserChanged);
  },
  componentWillUnmount: function () {
    UserStore.removeListener('changed:user', this.handleUserChanged);
  },
  handleUserChanged: function (user) {
    this.setState({user: user});
  },
  clearErrorMessage: function () {
    this.setState({errMsg: ""});
  },
  login: function (username, password) {
    UserActions.login(username, password);
  },
  render: function () {
    var user = this.state.user;
    var username = user? user.username: "";
    var pw = user? user.password: "";

    return (
      <div className="row">
        <div className="medium-centered medium-6 large-4 columns">
          <LoginPanel
            initialUsername={username}
            initialPassword={pw}
            errorMessage={this.state.errMsg}
            onLogin={this.login}
            onInput={this.clearErrorMessage}
            />
        </div>
      </div>
    );
  }
});
