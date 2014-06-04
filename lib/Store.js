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
    var flux = this.getFlux();
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
    var flux = this.getFlux();
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
              return store.getHandlerFor(actionName);
            });
            self._registerAction(actionName, key, handler, waitForHandlers);
          }
        }
      });
    }
  },

  getHandlerFor: function (actionName) {
    return this._actionMap[actionName];
  },

  mount: function (flux) {
    this.flux = flux;

    this.componentWillMount();

    this._resetState();
    this._configureActions();

    this.componentDidMount();
  },

  getInitialState: function () {
    return {};
  },

  //lifecycle
  componentWillMount: function () {

  },
  componentDidMount: function () {

  },
  componentWillUnmount: function () {
  },

  getFlux: function () {
    if (!this.flux) {
      throw new Error("Flux instance not defined. Did you call Flux.start()?");
    }
    else {
      return this.flux;
    }
  },

  //state
  get: function (key) {
    var returnVal;
    if (key.match(/\./)) {
      returnVal = mori.get_in(this.state, key.split('.'));
    }
    else {
      returnVal = mori.get(this.state, key);
    }
    return mori.clj_to_js(returnVal);
  },
  set: function (key, value) {
    value = mori.js_to_clj(value);
    if (key.match(/\./)) {
      var keys = key.split('.');
      this._updateState(mori.assoc_in(this.state, keys, value));
      this.emit('changed:'+keys.join(':'));
    }
    else {
      this._updateState(mori.assoc(this.state, key, value));
      this.emit('changed:'+key);
    }
  },
  update: function (key, updateFn) {
    if (key.match(/\./)) {
      var keys = key.split('.');
      this._updateState(mori.update_in(this.state, keys, updateFn));
      this.emit('changed:'+keys.join(':'));
    }
    else {
      this._updateState(mori.update_in(this.state, [key], updateFn));
      this.emit('changed:'+key);
    }
  },
  undo: function () {
    this.states = mori.pop(this.states);
    this.state = mori.peek(this.states) || mori.js_to_clj(this.getInitialState());
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
