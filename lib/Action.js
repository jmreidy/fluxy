var extend = require('lodash-node/modern/objects/assign');
var util = require('util');
var fnNameFromServiceName = require('./convertName');

var constructArgs = function (serviceName, args) {
  var arrArgs = Array.prototype.slice.call(args);
  arrArgs.unshift(serviceName);
  return arrArgs;
};

var Action = function () {};
Action.prototype = extend(Action.prototype, {
  actions: {},
  serviceActions: [],
  mount: function (flux) {
    this.flux = flux;

    this.dispatchAction = flux.dispatchAction.bind(flux);
    this._configureServiceActions();
  },
  _configureServiceActions: function () {
    var self = this;
    this.serviceActions.forEach(function (pair) {
      var serviceName = pair[0].value;
      var actionName = fnNameFromServiceName(serviceName);
      if (self[actionName]) {
        throw new Error('Cannot assign duplicate function name "' + actionName + '"');
      }

      self[fnNameFromServiceName(serviceName)] = function () {
        var args = constructArgs(serviceName, arguments);
        self.dispatchAction.apply(self.flux, args);
        return pair[1](args)
          .then(function () {
            self.dispatchAction.apply(self.flux, constructArgs(serviceName+'_COMPLETED', arguments));
          })
          .catch(function () {
            self.dispatchAction.apply(self.flux, constructArgs(serviceName+'_FAILED', arguments));
          });
      };
    });
  },
});

Action.extend = function (ChildProto) {
  var ChildFn = function () {};
  util.inherits(ChildFn, Action);
  ChildFn.prototype = extend(ChildFn.prototype, ChildProto);
  return ChildFn;
};

module.exports = Action;
