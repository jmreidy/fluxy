var extend = require('lodash-node/modern/objects/assign');
var util = require('util');
var fnNameFromServiceName = require('./convertName');

var constructArgs = function (serviceName, args) {
  var arrArgs = Array.prototype.slice.call(args);
  arrArgs.unshift(serviceName);
  return arrArgs;
};

var Action = function () {
 this._configureServiceActions();
};

Action.prototype = extend(Action.prototype, {
  actions: {},
  serviceActions: {},
  mount: function (flux) {
    this.flux = flux;

    this.dispatchAction = flux.dispatchAction.bind(flux);
  },
  _configureServiceActions: function () {
    var self = this;
    Object.keys(this.serviceActions).forEach(function (key) {
      var pair = self.serviceActions[key];
      var serviceName = pair[0].value;
      var actionName = key;
      if (self[actionName]) {
        throw new Error('Cannot assign duplicate function name "' + actionName + '"');
      }

      self[actionName] = function () {
        var args = constructArgs(serviceName, arguments);
        self.dispatchAction.apply(self.flux, args);
        return pair[1].apply(self, Array.prototype.slice.call(arguments))
          .then(function (result) {
            self.dispatchAction(serviceName+'_COMPLETED', result);
          })
          .catch(function (err) {
            self.dispatchAction(serviceName+'_FAILED', err);
          });
      };
    });
  },
});

Action.extend = function (ChildProto) {
  var ChildFn = function () {
    Action.call(this);
  };
  util.inherits(ChildFn, Action);
  ChildFn.prototype = extend(ChildFn.prototype, ChildProto);
  return ChildFn;
};

module.exports = Action;
