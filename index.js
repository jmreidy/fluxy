var Dispatcher = require('./lib/Dispatcher');
var FluxStore = require('./lib/Store');
var FluxActions = require('./lib/Action');
var extend = require('lodash-node/modern/objects/assign');

var stores = [];
var actions = [];

var Flux = function () {
  this._dispatcher = new Dispatcher();
}

Flux.createStore = function (proto) {
  var Store = FluxStore.extend(function () {
    FluxStore.call(this);
  }, proto);
  var store = new Store();
  stores.push(store);
  return store;
}

Flux.createActions = function (proto) {
  var Action = FluxActions.extend(proto);
  var action = new Action();
  actions.push(action);
  return action;
};

Flux.start = function () {
  var flux = new Flux();
  stores.forEach(function (store) {
    store.mount(flux);
  });
  actions.forEach(function (action) {
    action.mount(flux);
  });
  return flux;
}


Flux.prototype = extend(Flux.prototype, {
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

module.exports = Flux;