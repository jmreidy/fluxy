var Dispatcher = require('./lib/Dispatcher');
var FluxStore = require('./lib/Store');
var FluxActions = require('./lib/Action');
var FluxConstants = require('./lib/Constants');
var extend = require('lodash-node/modern/objects/assign');

var stores = [];
var actions = [];

var assignDataToStore = function(initialData, Store) {
  if (Store.name && initialData) {
    var state = initialData[Store.name];
    if (state) {
      Store.replaceState(state);
    }
  }
};

var safeStringify = function (obj) {
  return JSON.stringify(obj).replace(/<\//g, '<\\\\/').replace(/<\!--/g, '<\\\\!--');
};


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

Fluxy.start = function (initialData) {
  var flux = new Fluxy();
  stores.forEach(function (store) {
    store.mount(flux);
    assignDataToStore(initialData, store);
  });
  actions.forEach(function (action) {
    action.mount(flux);
  });
  return flux;
};

Fluxy.bootstrap = function (key, context) {
  var initialData;
  if (!context && window) {
    context = window;
  }

  if (context && context[key]) {
    initialData = context[key];
  }

  Fluxy.start(initialData);
};

Fluxy.renderStateToString = function (serializer) {
  var state = {};
  serializer = serializer || safeStringify;
  stores.forEach(function (store) {
    if (store.name) {
      state[store.name] = store.toJS(store.state);
    }
  });

  return serializer(state);
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
