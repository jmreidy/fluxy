var extend = require('lodash-node/modern/objects/assign');
var util = require('util');

var fnNameFromServiceName = function (name) {
  name =  name.toLowerCase();
  name = name.replace(/_(\w{1})/, function (match, letter, word) {
    return letter.toUpperCase();
  });
  return name;
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
        var args = Array.prototype.slice.call(arguments);
        args.unshift(serviceName);
        self.dispatchAction.apply(self.flux, args);
        return pair[1](args)
          .then(function (result) {
            self.dispatchAction(serviceName+'_COMPLETED', {payload: result});
          })
          .catch(function (err) {
            self.dispatchAction(serviceName+'_FAILED', {error: err});
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
