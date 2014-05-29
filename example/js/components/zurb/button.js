/** @jsx React.DOM */
var React = require("react");
var Addons  = require("react/addons").addons;

module.exports = React.createClass({
  propTypes: {
    size: React.PropTypes.oneOf(['tiny', 'small', 'large']),
    color: React.PropTypes.oneOf(['secondary', 'success', 'alert']),
    radius: React.PropTypes.oneOf(['radius', 'round']),
    expand: React.PropTypes.bool,
    enabled: React.PropTypes.bool
  },
  render: function () {
    var classSet = Addons.classSet({
      'button': true,
      'disabled': (this.props.enabled !== true),
    });
    classSet[this.props.size] =  this.props.size;
    classSet[this.props.radius] =  this.props.radius;
    classSet[this.props.color] = this.props.color;

    return (
      <button type="submit" className={classSet}>{this.props.label}</button>
    );
  }

})
