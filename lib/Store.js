/** @jsx React.DOM */
var util = require("util");
var extend = require('lodash-node/modern/objects/assign');
var convertName = require('./convertName');
var $ = require('./collections/Proxy');

/**
* @description This function takes an `actionName` parameter and returns a string
* that represents the action key for that name.
* 
* @param { string } actionName - The `actionName` input parameter passed to the
* `getActionKeyForName()` function is simply a string representing the action name.
* 
* @returns { string } The function `getActionKeyForName` takes a string argument
* `actionName`, and returns a string that is the concatenation of "handle" and the
* first letter of the input string (in uppercase) followed by the rest of the string.
* 
* The output of this function for example inputs such as "save", "cancel", or "delete"
* would be "handleSave", "handleCancel", or "handleDelete", respectively.
*/
var getActionKeyForName = function (actionName) {
  var name = actionName;
  if (name.value) {
    name = name.value;
  }
  name = convertName(name);
  name = name.charAt(0).toUpperCase() + name.substr(1, name.length);
  return 'handle'+name;
};

/**
* @description This function takes a single argument `val` and returns an array
* containing `val` or an array with only `val` if `val` is not an array.
* 
* @param { any } val - In this function `toArray`, the `val` parameter is used to
* take an argument that may be a non-array value and return it as an array with a
* single element.
* 
* @returns { array } The output returned by this function is an array with a single
* element that contains the input `val`. If `val` is already an array or has no
* arguments (i.e., `undefined`), then the output is returned unchanged. In all other
* cases (i.e., if `val` is not an array), the input `val` is wrapped into an array
* with a single element.
*/
var toArray = function (val) {
  if (!Array.isArray(val)) {
    val = [val];
  }
  return val;
};

/**
* @description Nothing.
* 
* @returns {  } The function `Store()` does not return anything since it does not
* have a `return` statement.
*/
var Store = function () {};

Store.prototype = extend(Store.prototype, {
/**
* @description This function returns the flux instance if it exists and has been
* initialized (i.e., throw an error if it's undefined).
* 
* @returns {  } The function `_getFlux` returns the instance of the `Flux` object
* if it exists and throws an error if it does not exist.
* 
* Output: The instance of the `Flux` object if it exists (either a valid object or
* `undefined`).
*/
  _getFlux: function () {
    if (!this.flux) {
      throw new Error("Flux instance not defined. Did you call Flux.start()?");
    }
    else {
      return this.flux;
    }
  },
/**
* @description This function updates the current state of the object and adds the
* new state to an array of states that the object has been through.
* 
* @param { object } newState - The `newState` input parameter is used to update the
* current state of the object.
* 
* @returns { object } This function takes a new state as input and updates the current
* state of the object to that new state. The output of the function is a new array
* that contains both the updated state and all the previous states.
*/
  _updateState: function (newState) {
    this.state = newState;
    this.states = $.conj(this.states, newState);
  },
/**
* @description The function `_resetState` resets the internal state of the component
* by setting it to its initial state using `getInitialState`, and then storing the
* state as a JavaScript object (`$.fromJS()` or `$.toVector()`) for later use.
* 
* @returns {  } The function `_resetState` resets the state of the component to its
* initial state. It takes an optional `t` parameter which can be either an instance
* of a state object or a JSON-serialized representation of the initial state.
* 
* If `t` is not an instance of a state object (i.e., it is null or undefined), the
* function creates a new state object using `$.fromJS(t)`, otherwise it uses the
* given `t` as the initial state.
*/
  _resetState: function () {
    var t = this.getInitialState();
    if (!$.isInstance(t)) {
      this.state = $.fromJS(t);
    } else {
      this.state = t;
    }
    this.states = $.toVector(this.state);
  },
/**
* @description This function registers an action with the flux store by mapping it
* to a specific key.
* 
* @param { string } actionName - The `actionName` parameter is the name of the action
* being registered.
* 
* @param { object } actionKey - The `actionKey` input parameter is used to store the
* returned action object (registered by Flux) as a property on the component's
* prototype (this), so it can be accessed later from within the component's methods.
* 
* @param {  } handler - The `handler` input parameter is a callback function that
* will be called when the action is triggered.
* 
* @param { boolean } waitForHandlers - The `waitForHandlers` input parameter tells
* the `registerDeferedAction` function to wait for all previously registered handlers
* to finish executing before calling the new handler.
* 
* @returns { Promise } The `registerAction` function returns the registered action
* object with a `bind` method that binds the specified `handler` function to the
* calling context (`this`).
*/
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
/**
* @description This function `_configureActions` configures the actions for a store
* by registering the actions with their corresponding handlers and waits for certain
* store's handlers to be executed before allowing the action's handler to execute.
* 
* @returns {  } This function takes an array of actions as input and registers them
* with a flux store. It returns nothing (i.e., void), but instead modifies the
* internal state of the store by registering the actions.
*/
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

/**
* @description This function returns the handler function for a specific action name
* within the class's _actionMap dictionary.
* 
* @param { string } actionName - The `actionName` input parameter is used to identify
* the specific action being requested.
* 
* @returns { object } The output returned by this function is `undefined`. The
* function takes an `actionName` argument and returns the value stored under that
* key within the `_actionMap` object if there is one.
*/
  _getHandlerFor: function (actionName) {
    return this._actionMap[actionName];
  },

/**
* @description This function notifies any registered watchers of changes to the
* `this` object's properties.
* 
* @param { array } keys - The `keys` input parameter is an array of property names
* that have changed.
* 
* @param { object } oldState - The `oldState` parameter represents the previous value
* of the watched property. It is passed along with the new value (in the `newState`
* parameter) to the watcher functions.
* 
* @param { object } newState - The `newState` input parameter provides the updated
* state values for the watched properties.
* 
* @returns { object } This function takes three parameters `keys`, `oldState`, and
* `newState`, and returns nothing (i.e., `undefined`).
*/
  _notify: function(keys, oldState, newState) {
    if (this.watchers) {
      this.watchers.forEach(function (w) {
        w(keys, oldState, newState);
      });
    }
  },

/**
* @description The `addWatch` function adds a new watcher to the end of the watcher
* array.
* 
* @param { object } watcher - The `watcher` input parameter is an object that contains
* the methods to be called when the watched expression changes.
* 
* @returns { any } The output returned by this function is `undefined`. The function
* does not have a return statement or any explicit return value; it only has a push
* method call to the `watchers` array.
*/
  addWatch: function (watcher) {
    this.watchers.push(watcher);
  },

/**
* @description This function removes a watcher (watcher variable) from the list of
* watchers associated with an object.
* 
* @param { object } watcher - The `watcher` input parameter is the Watcher object
* to be removed from the array of watchers.
* 
* @returns { array } This function takes a `watcher` parameter and returns a filtered
* array of watchers.
*/
  removeWatch: function (watcher) {
    this.watchers = this.watchers.filter(function (w) {
      return w !== watcher;
    });
  },

/**
* @description This function `mount` is responsible for setting up the Flux app by:
* 
* 1/ Setting the `flux` object as a reference to the main Flux dispatcher.
* 2/ Creating an array of watchers.
* 3/ Resetting the internal state to its default value.
* 4/ Configuring the actions.
* 
* @param { object } flux - The `flux` input parameter is used to pass a Flux application
* object to the `mount` function.
* 
* @returns {  } The output of the `mount` function is not explicitly stated as it
* is an optional parameter and can be removed without affecting the function's purpose.
* 
* The `mount` function takes a `flux` object as input and performs some setup tasks:
* 
* 1/ Assigns the `flux` object to the `this.flux` property.
* 2/ Initializes an empty array `this.watchers`.
* 3/ Calls `_resetState()` method.
* 4/ Calls `_configureActions()` method.
* 
* Therefore the output of the `mount` function is not a explicit value but rather
* the prepared state of the component for receiving and handling events from the flux.
*/
  mount: function (flux) {
    this.flux = flux;

    this.watchers = [];
    this._resetState();
    this._configureActions();
  },

/**
* @description This function converts a value to JavaScript objects.
* 
* @param { string } val - The `val` input parameter is the value that should be
* converted to JSON.
* 
* @returns { object } The function `toJS` takes a value as an argument and returns
* its JavaScript serialization (JSON). In other words. the function converts the
* value to a JSON representation.
*/
  toJS: function (val) {
    return $.toJS(val);
  },

  //state
/**
* @description The `getInitialState` function returns an empty object `{}`, which
* sets the initial state of the component to be an empty object.
* 
* @returns { object } The output of the `getInitialState` function is an empty object
* `{}`.
*/
  getInitialState: function () {
    return {};
  },

/**
* @description This function is a getter method that returns the value of a specified
* property or properties within an object.
* 
* @param { object } keys - The `keys` input parameter is a collection of key names
* or a single string key name that specifies which properties of the `state` object
* should be retrieved.
* 
* @returns { object } The output returned by this function is `this.state` if the
* input `keys` is `undefined` or `null`, and `$.getIn(this.state(), keys)` if `keys`
* is a string or an array with at least one element.
*/
  get: function (keys) {
    if (typeof keys !== "undefined" && keys !== null) {
      if (typeof keys === 'string') {
        return $.get(this.state, keys);
      }
      if (Array.isArray(keys) && keys.length === 0) {
        return this.state;
      }
      return $.getIn(this.state, keys);
    } else {
      return this.state;
    }
  },

/**
* @description This function takes an array of keys and returns the value of those
* properties as a JavaScript object.
* 
* @param { array } keys - The `keys` input parameter is an array of property names
* that determines which properties to include when converting the object to a
* JavaScript object.
* 
* @returns { object } The output returned by the `getAsJS` function is a JavaScript
* object converted from the underlying model's properties using the `$.toJS()` method.
*/
  getAsJS: function (keys) {
    return $.toJS((this.get(keys)));
  },

/**
* @description This function is a setter method for an object that manages its state
* using Immutable.js.
* 
* @param { array } keys - The `keys` input parameter specifies an array of keys to
* be updated within the state object.
* 
* @param { object } value - The `value` input parameter is either a key-value object
* or a function that updates the state of the Redux store by merging or replacing
* part of the state with a new value.
* 
* @returns { object } This function is a setter function for an object's state. It
* takes two arguments: `keys`, which is an optional list of keys to update; and
* `value`, which is the new value for the updated keys.
* 
* The function first checks if `keys` is null or an empty array before proceeding.
* If it is empty or null , the function returns the setter function with no arguments
* (i.e., `this.set(null)`).
* 
* If `keys` is a non-empty array of keys and `value` is a function， the function
* updates each key's value by calling `value` on the current state.
*/
  set: function (keys, value) {
    var newState, oldState = this.state, arrKeys;
    if (typeof keys !== "undefined" && keys !== null) {
      var arrKeys = toArray(keys);
      if (arrKeys.length === 0) {
        return this.set(null, value);
      }
      if (typeof value === 'function') {
        newState = $.updateIn(this.state, arrKeys, value);
      }
      else {
        newState = $.assocIn(this.state, arrKeys, value);
      }
    } else {
      if (typeof value === 'function') {
        newState = value(this.state);
        if (!$.isInstance(newState)) {
          newState = $.fromJS(newState);
        }
      } else {
        newState = value;
      }
    }
    this._updateState(newState);
    this._notify(keys, oldState, newState);
  },

/**
* @description This function takes a JavaScript object `value` and sets the `keys`
* on the Ember object using `set`.
* 
* @param { array } keys - The `keys` input parameter is used to specify the property
* names of the object that should be set from the JavaScript value.
* 
* @param { object } value - The `value` input parameter is ignored and not used
* inside the `setFromJS` function.
* 
* @returns { object } The `setFromJS` function takes two parameters `keys` and
* `value`, and it returns `this`. In other words the function does not return any
* value explicitly but rather returns the `this` context of the object on which the
* method is called.
*/
  setFromJS: function (keys, value) {
    this.set(keys, $.fromJS((value)));
  },

/**
* @description This function undoes the last state change by popping the current
* state from the `states` array and setting the new state to the previous one.
* 
* @returns { array } The `undo` function takes no arguments and returns no value.
* It undoes the last action by popping an element from the `states` array and setting
* the `state` property to the peeked element.
*/
  undo: function () {
    var oldState =  this.state;
    if ($.count(this.states) > 1) {
      this.states = $.pop(this.states);
      this.state = $.peek(this.states);
    }
    this._notify('*', oldState, this.state);
  },

/**
* @description The function `replaceState` takes a new state object `state` and
* replaces the current state of the application with it.
* 
* @param { object } state - The `state` input parameter is used to replace the current
* state of the application with a new one.
* 
* @returns { object } The output returned by the `replaceState` function is a vector
* of states. Here's a concise description:
* 
* The function takes a state object `state` and replaces the current state with it.
* It converts the state from a JavaScript object to avector using `$.toVector`.
*/
  replaceState: function (state) {
    this.state = $.fromJS((state));
    this.states = $.toVector(this.state);
  },

/**
* @description This function compares two objects for equality using the `$.equals()`
* method.
* 
* @param { object } a - In this context `$` is a jQuery object that refers to the
* current element being manipulated. `$.equals(a)` compares two jQuery objects by
* checking if they are equal by using their internal `===()` method or `==()` method
* when comparing properties or quantities. As `a` is already a jQuery object and `b`
* can also be one at the time of calling `$=.equals(a`, passing it through this
* function essentially is redundant because we do `return $.Equals(a)` and it's
* equivalent to simply returning the return value of `$.Equals(a)`. Therefore it may
* as well not have been written `= $..etc`. Because of this `a` input serves little
* purpose other than potentially altering which `.equals()` function is being
* referenced (i.e changing this into `return jQuery.prototype.eqUals(a)` alters the
* scope reference and therefore makes no actual difference since it already is a
* jQuery object being compared and no real function overides have occurred). In
* general you can think of it more like just providing `$` rather than directly
* referring to `$.Equals()` directly  as long as `a` is a valid jquery-referenced
* value that may make the comparison (or alter reference context within any called
* function/method) or `false` since any falsy/ undefined values provided are likely
* not to pass. As such because it need not modify the state of its receiver as all
* this function truly does with some slight sugar-code-rewriting syntax(like using
* `$()`) instead of `$equal` would more accurately reflect its functional intent
* with perhaps the minor possible misinterpretation or ambiguity due to naming
* conventions. (Although the context already is clear given where it is called this
* confusion would probably not likely occur since other places would make no such
* ambiguities clear if defined like such as well). If read less concisely "A" may
* simply have the effect of making a redundant declaration within these constraints(which
* serves only to redeclare `$` from a differnt scope for potential performance reasons
* or naming conventions which might alter context) so could more simply be ommitted
* or given no special attention beyond what I mentioned since both objects already
* share reference equivalence by being a jQuery obj within the scope at the point
* this comparison is done (effectively acting like simple pointers since object
* comparions are just true/ false).
* So ultimately $/a serve similar purposes and serve little additional actual
* functional importance and the more appropriate terms to use when referencing would
* be a name like `referencedObject` to better delineate the actual use within these
* limited parameters. Since $ will default to either `$` object provided with a
* different reference and as such this may have little reason other than perhaps
* changing behavior slightly through scope context (for perphaps perf or simply
* naming convention sake.) If we interpret as more broadly "A" refersing to both `a`
* value passed and also to refernce-jquery obj $ . The later may simply be referenced
* from an unrelated source without much relevance past initialization of its values
* or as is likely here `$.equals(a)` which can operate with a self ref if it chooses
* for the function logic since we are using `.()` or dot notation.
* 
* @param { any } b - The `b` input parameter is not used at all within the `equals`
* function. It is only passed as an argument to the `$.equals()` method call inside
* the function body.
* 
* @returns { boolean } The function takes two parameters `a` and `b`, and returns
* the result of the `$.equals()` method called on each parameter. Since `undefined`
* does not have a `$.equals()` method defined on it by JavaScript's global object
* (`window` or `self`), attempting to call `$.equals(undefined)` will result immediately
* throw a "TypeError:Cannot call method 'equals' of undefined" exception without
* returning any value.
*/
  $equals: function (a, b) { return $.equals(a, b); }
});

Store.extend = function (ChildFn, ChildProto) {
  util.inherits(ChildFn, Store);
  if (ChildProto) {
    ChildFn.prototype = extend(ChildFn.prototype, ChildProto);
  }
  return ChildFn;
};


module.exports = Store;

