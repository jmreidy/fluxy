/** @jsx React.DOM */
var util = require("util");
var extend = require('lodash-node/modern/objects/assign');
var convertName = require('./convertName');
var $ = require('./collections/Proxy');

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
    this.states = $.conj(this.states, newState);
  },
  _resetState: function () {
    this.state = $.fromJS(this.getInitialState());
    this.states = $.toVector(this.state);
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
    if (this.watchers) {
      this.watchers.forEach(function (w) {
        w(keys, oldState, newState);
      });
    }
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
    return $.toJS(val);
  },

  //state
  getInitialState: function () {
    return {};
  },

  get: function (keys) {
    if (typeof keys !== "undefined" && keys !== null) {
      if (typeof keys === 'string') {
        return $.get(this.state, keys);
      }
      return $.getIn(this.state, keys);
    } else {
      return this.state;
    }
  },

  getAsJS: function (keys) {
    return $.toJS((this.get(keys)));
  },

  set: function (keys, value) {
    var newState, oldState = this.state, arrKeys;
    if (typeof keys !== "undefined" && keys !== null) {
      var arrKeys = toArray(keys);
      if (typeof value === 'function') {
        oldState = this.state;
        newState = $.updateIn(this.state, arrKeys, value);
      }
      else {
        oldState = this.state;
        newState = $.assocIn(this.state, arrKeys, value);
      }
    } else {
      newState = value;
    }
    this._updateState(newState);
    this._notify(keys, oldState, newState);
  },

  setFromJS: function (keys, value) {
    this.set(keys, $.fromJS((value)));
  },

  undo: function () {
    var oldState =  this.state;
    if ($.count(this.states) > 1) {
      this.states = $.pop(this.states);
      this.state = $.peek(this.states);
    }
    this._notify('*', oldState, this.state);
  },

  replaceState: function (state) {
    this.state = $.fromJS((state));
    this.states = $.toVector(this.state);
  }
});

Store.extend = function (ChildFn, ChildProto) {
  util.inherits(ChildFn, Store);
  if (ChildProto) {
    ChildFn.prototype = extend(ChildFn.prototype, ChildProto);
  }
  return ChildFn;
};


module.exports = Store;
