/** @jsx React.DOM */
var React = require("react");
var ReactRouter = require('react-router');

var LoginPage = require("../pages/LoginPage");
var ListPage = require("../pages/ListPage");
var Routes = ReactRouter.Routes;
var Route = ReactRouter.Route;

var Wrapper = React.createClass({
  render: function () {
    return (
      <div>
        {this.props.activeRoute}
      </div>
    );
  }
});

module.exports = React.createClass({
  render: function () {
    return (
      <Routes handler={Wrapper} location="history">
        <Route name="login" path="login" handler={LoginPage} />
        <Route name="list" path="list" handler={ListPage} />
      </Routes>
    );
  }
});
