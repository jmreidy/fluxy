/**
 * Copyright 2014 Justin Reidy
 *
 * Dispatcher
 *
 * The Dispatcher is capable of registering callbacks and invoking them.
 * More robust implementations than this would include a way to order the
 * callbacks for dependent Stores, and to guarantee that no two stores
 * created circular dependencies.
 */

var Promise = require('bluebird');
var extend = require('lodash-node/modern/objects/assign');

var Dispatcher = function () {
  this._actions = {};
  this._tokens = {};
  this._currentDispatch;
  this._dispatchQueue = [];

  this._registerActionHandler = function (action, handler) {
    this._actions[action] || (this._actions[action] = []);
    return this._actions[action].push(handler)
  };

  this._processQueue = function () {
    this._tokens = {};
    var nextDispatch = this._dispatchQueue.shift();
    if (nextDispatch) {
      this.dispatchAction(nextDispatch.action, nextDispatch.payload);
    }
  };

  this._activatePromise = function (idx, handler, payload) {
    var promise = this._tokens[idx];
    if (!promise) {
      promise = handler(payload);
      this._tokens[idx] = promise;
    }
    return promise;
  };
}

Dispatcher.prototype = extend(Dispatcher.prototype, {
  /**
   * register a callback function to an action
   * @param {string} action The name of the action to register against
   * @param {handler} function A handler function that will be invoked with payload
   */
  registerAction: function (action, handler) {
    var idx = this._registerActionHandler(action, handler);
    var actionHandler = function () {
      return this._tokens[idx];
    }
    actionHandler._id = handler;
    return actionHandler;
  },

  /**
   * register an action with explicit dependencies
   * The dependencies are executed serially
   * @param {string} action The name of the action to register against
   * @param {array} actionHandlers Array of handlers that prevede this handler
   * @param {function} handler The action handler fn
   */
  registerDeferedAction: function (action, actionHandlers, handler) {
    var self = this;

    return this.registerAction(action, function (payload) {
      var handlerIndexes = actionHandlers.map(function (func) {
        return self._actions[action].indexOf(func._id);
      });
      return Promise.reduce(handlerIndexes, function (current, idx) {
        return self._activatePromise(idx, self._actions[action][idx], payload);
      }, 0
      ).then(function () {
        return handler(payload);
      });
    });
  },

  /**
   * dispatch a named action with a payload
   * @param  {action} action The name of the action to dispatch
   * @param  {object} payload The data from the action.
   */
  dispatchAction: function(action, payload) {
    var self = this;
    var handlers = this._actions[action];
    if (!handlers || handlers.length < 1) {
      return;
    }

    if (!this._currentDispatch || this._currentDispatch.isResolved()) {
        this._currentDispatch = Promise.map(
            handlers,
            function (handler, idx) {
              return self._activatePromise(idx, handler, payload);
            }
        );
        this._currentDispatch.finally(this._processQueue.bind(this));
    }
    else {
      this._dispatchQueue.push({action: action, payload: payload});
    }
  }
});


module.exports = Dispatcher;
