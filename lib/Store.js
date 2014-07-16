/** @jsx React.DOM */
var util = require("util");
var extend = require('lodash-node/modern/objects/assign');
var convertName = require('./convertName');
var mori = require('mori');

var getActionKeyForName = function (actionName) {
  var name = actionName;
  if (name.value) {
    name = name.value;
  }
  name = convertName(name);
  name = name.charAt(0).toUpperCase() + name.substr(1, name.length);
  return 'handle'+name;
};

var toArray = function (val) {
  if (!Array.isArray(val)) {
    val = [val];
  }
  return val;
};

var Store = function () {};

Store.prototype = extend(Store.prototype, {
  _getFlux: function () {
    if (!this.flux) {
      throw new Error("Flux instance not defined. Did you call Flux.start()?");
    }
    else {
      return this.flux;
    }
  },
  _updateState: function (newState) {
    this.state = newState;
    this.states = mori.conj(this.states, newState);
  },
  _resetState: function () {
    this.state = mori.js_to_clj(this.getInitialState());
    this.states = mori.vector(this.state);
  },
  _registerAction: function (actionName, actionKey, handler, waitForHandlers) {
    var registeredAction;
    var flux = this._getFlux();
    if (waitForHandlers) {
      registeredAction = flux.registerDeferedAction(actionName, waitForHandlers, handler.bind(this));
    }
    else {
      registeredAction = flux.registerAction(actionName, handler.bind(this));
    }
    this[actionKey] = registeredAction;
    this._actionMap[actionName] = registeredAction;
  },
  _configureActions: function () {
    var self = this;
    var flux = this._getFlux();
    this._actionMap = {};

    if (this.actions) {
      this.actions.forEach(function (action) {
        if (!action[0]) {
          throw new Error("Action name must be provided");
        }
        if (action.length < 2 || (typeof action[action.length-1] !== "function")) {
          throw new Error("Action handler must be provided");
        }

        var actionName = action[0];
        var actionKey = getActionKeyForName(actionName);

        if (action.length === 2) {
          self._registerAction(actionName, actionKey, action[1]);
        }
        else {
          var opts = action[1];
          var handler = action[2];
          var waitFor = opts.waitFor;
          if (waitFor) {
            if (!Array.isArray(waitFor)) {
              waitFor = [waitFor];
            }
            var waitForHandlers = waitFor.map(function(store) {
              return store._getHandlerFor(actionName);
            });
            self._registerAction(actionName, actionKey, handler, waitForHandlers);
          }
        }
      });
    }
  },

  _getHandlerFor: function (actionName) {
    return this._actionMap[actionName];
  },

  _notify: function(keys, oldState, newState) {
    this.watchers.forEach(function (w) {
      w(keys, oldState, newState);
    });
  },

  addWatch: function (watcher) {
    this.watchers.push(watcher);
  },

  removeWatch: function (watcher) {
    this.watchers = this.watchers.filter(function (w) {
      return w !== watcher;
    });
  },

  mount: function (flux) {
    this.flux = flux;

    this.watchers = [];
    this._resetState();
    this._configureActions();
  },

  toJS: function (val) {
    return mori.clj_to_js(val);
  },

  //state
  getInitialState: function () {
    return {};
  },

  get: function (keys) {
    if (typeof keys === 'string') {
      return mori.get(this.state, keys);
    }
    return mori.get_in(this.state, keys);
  },

  getAsJS: function (keys) {
    return mori.clj_to_js(this.get(keys));
  },

  set: function (keys, value) {
    var newState, oldState;
    var arrKeys = toArray(keys);
    if (typeof value === 'function') {
      oldState = this.state;
      newState = mori.update_in(this.state, arrKeys, value);
    }
    else {
      oldState = this.state;
      newState = mori.assoc_in(this.state, arrKeys, value);
    }
    this._notify(keys, oldState, newState);
    this._updateState(newState);
  },

  undo: function () {
    if (mori.count(this.states) > 1) {
      this.states = mori.pop(this.states);
      this.state = mori.peek(this.states);
    }
  }
});

Store.extend = function (ChildFn, ChildProto) {
  util.inherits(ChildFn, Store);
  if (ChildProto) {
    ChildFn.prototype = extend(ChildFn.prototype, ChildProto);
  }
  return ChildFn;
};

//expose Mori functions on Store
Object.keys(mori).forEach(function (key) {
  Store[key] = mori[key];
});


module.exports = Store;
