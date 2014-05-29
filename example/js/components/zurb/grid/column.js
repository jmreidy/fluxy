/** @jsx React.DOM */

var React = require("react")

module.exports = React.createClass({
  propTypes: {
    small: React.PropTypes.number,
    medium: React.PropTypes.number,
    large: React.PropTypes.number
  },
  render: function () {
    var self = this;


    var classes = [];
    ["small", "medium", "large"].forEach(function (size) {
      var count = self.props[size];
      if (count) {
        classes.push(size+"-"+count);
      }
    });
    classes.push("columns");

    return (
      <div className={classes.join(" ")}>
        {this.props.children}
      </div>
    );
  }
});

