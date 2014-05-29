/** @jsx React.DOM */
var React = require("react")

var AuthenticatedRoute = require('../mixins/AuthenticatedRoute');

var Link = require('react-router').Link;
var Row = require("../components/zurb/grid/row");
var Column = require("../components/zurb/grid/column");

module.exports = React.createClass({
  mixins: [AuthenticatedRoute],
  getInitialState: function () {
    return {
      items: [
        {name: 'foo', value: 1},
        {name: 'bar', value: 2}
      ]
    };
  },
  render: function () {
    var items = this.state.items.map(function (item) {
      return (<li>{item.name}:{item.value}</li>);
    });

    return (
      <Row>
        <Column small={12}>
          <h3>List</h3>
          <Row>
            <Column small={12}>
              <ul>
                {items}
              </ul>
              <Link to="login" className="btn">Back to Login</Link>
            </Column>
          </Row>
        </Column>
      </Row>
    );
  }
});
