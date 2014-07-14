var extend = require('lodash-node/modern/objects/assign');
var util = require('util');

var Action = function () {};
Action.prototype = extend(Action.prototype, {
  mount: function (flux) {
    this.flux = flux;

    this.dispatchAction = flux.dispatchAction.bind(flux);
    this.componentWillMount();
    this.componentDidMount();
  },

  //lifecycle
  componentWillMount: function () {},
  componentDidMount: function () {},
  componentWillUnmount: function () {},

});

Action.extend = function (ChildProto) {
  var overridable = ["componentWillMount", "componentDidMount", "componentWillUnmount"];
  var ChildFn = function () {};
  util.inherits(ChildFn, Action);
  ChildFn.prototype = extend(ChildFn.prototype, ChildProto);
  overridable.forEach(function (key) {
    if (ChildProto[key]) {
      ChildFn.prototype[key] = ChildProto[key];
    }
  });
  return ChildFn;
}

module.exports = Action;
