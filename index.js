var Dispatcher = require('./lib/Dispatcher');
var FluxStore = require('./lib/Store');
var FluxActions = require('./lib/Action');
var FluxConstants = require('./lib/Constants');
var extend = require('lodash-node/modern/objects/assign');

var stores = [];
var actions = [];

var Fluxy = function () {
  this._dispatcher = new Dispatcher();
};

Fluxy.createStore = function (proto) {
  var Store = FluxStore.extend(function () {
    FluxStore.call(this);
  }, proto);
  var store = new Store();
  stores.push(store);
  return store;
};

Fluxy.createActions = function (proto) {
  var Action = FluxActions.extend(proto);
  var action = new Action();
  actions.push(action);
  return action;
};

Fluxy.createConstants = function (values) {
  return FluxConstants(values);
};

Fluxy.start = function () {
  var flux = new Fluxy();
  stores.forEach(function (store) {
    store.mount(flux);
  });
  actions.forEach(function (action) {
    action.mount(flux);
  });
  return flux;
};

Fluxy.reset = function () {
  stores = [];
  actions = [];
};


Fluxy.prototype = extend(Fluxy.prototype, {
  //dispatcher delegation
  registerAction: function () {
    return this._dispatcher.registerAction.apply(this._dispatcher, arguments);
  },
  registerDeferedAction: function () {
    return this._dispatcher.registerDeferedAction.apply(this._dispatcher, arguments);
  },
  dispatchAction: function () {
    return this._dispatcher.dispatchAction.apply(this._dispatcher, arguments);
  },
});

module.exports = Fluxy;
module.exports.$ = require('mori');
