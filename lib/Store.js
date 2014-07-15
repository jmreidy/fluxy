/** @jsx React.DOM */
var events = require("events");
var util = require("util");
var extend = require('lodash-node/modern/objects/assign');
var mori = require('mori');

var Store = function () {
  events.EventEmitter.call(this);
}

util.inherits(Store, events.EventEmitter);

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
      Object.keys(this.actions).forEach(function (key) {
        var action = self.actions[key];
        if (!action[0]) {
          throw new Error("Action name must be provided");
        }
        if (action.length < 2 || (typeof action[action.length-1] !== "function")) {
          throw new Error("Action handler must be provided");
        }

        var actionName = action[0];
        if (action.length === 2) {
          self._registerAction(actionName, key, action[1]);
        }
        else {
          var opts = action[1];
          var handler = action[2]
          if (opts.waitFor) {
            var waitForHandlers = opts.waitFor.map(function(store) {
              return store._getHandlerFor(actionName);
            });
            self._registerAction(actionName, key, handler, waitForHandlers);
          }
        }
      });
    }
  },

  _getHandlerFor: function (actionName) {
    return this._actionMap[actionName];
  },

  mount: function (flux) {
    this.flux = flux;

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
    if (typeof value === 'function') {
      if (typeof keys !== 'object') { keys = [keys]; }
      this.state = mori.update_in(this.state, keys, value);
    }
    else {
      if (typeof keys !== 'object') { keys = [keys]; }
      this.state = mori.assoc_in(this.state, keys, value);
    }
  },

  undo: function () {
    var previousState = this.states;
    if (mori.length(previousStates) > 1) {
      this.states = mori.pop(previousStates);
      this.state = mori.peek(previousStates);
    }
  }
});

Store.extend = function (ChildFn, ChildProto) {
  var overridable = ["getInitialState", "componentWillMount", "componentDidMount"];
  util.inherits(ChildFn, Store);
  if (ChildProto) {
    ChildFn.prototype = extend(ChildFn.prototype, ChildProto);
    overridable.forEach(function (key) {
      if (ChildProto[key]) {
        ChildFn.prototype[key] = ChildProto[key];
      }
    });
  }
  return ChildFn;
}

//expose Mori functions on Store
Object.keys(mori).forEach(function (key) {
  Store[key] = mori[key];
});


module.exports = Store;
