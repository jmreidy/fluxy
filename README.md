[![Build Status](https://travis-ci.org/jmreidy/fluxy.svg?branch=master)](https://travis-ci.org/jmreidy/fluxy)
#Fluxy

An implementation of Facebook's Flux architecture.

##Introduction

The Facebook / React team has an [introduction to
Flux](http://facebook.github.io/react/docs/flux-overview.html) included with
the React documentation. Distilled to its core, Flux reimagines the
traditional MVC approach to client-side webapps, replacing it with the
same concept of "one-way data flow" that powers React.

While the Facebook documentation (and accompanying video) do an excellent job of
introducing the core concepts behind Flux, there's a few key details that are important
to emphasize:

###Stores
All application data is managed in Stores, which are Singleton objects focused on a specific
set of business logic (e.g ArticleStore, UserStore). Views should interact with Stores
as the single source of data truth. Store *do not replace* the React state system; rather,
React components should use state to handle view-specific data state, and stores to handle application
data state. Stores are event emitters that emit change events for underlying state changes.

###Actions
While Views access data directly from Stores, they never mutate data directly. Rather,
Views should trigger Actions, which in turn trigger broadcast notifications throughout the system.
Broadcast notifications are identified via lookups in enum Constants, and include a payload object.

For example, clicking a button in a view to favorite an article would make a call to an ArticleFavorite action,
which would then broadcast a FAVORITE_ARTICLE notification with an appropriate payload
for any Stores that want to perform an optimistic update. The Action would then interact with a DAO
or Service to perform the actual server-side favorite; depending on the result of this interaction,
the Action would then broadcast a FAVORITE_ARTICLE_COMPLETED or FAVORITE_ARTICLE_FAILED notification.

###Dispatcher
Each of the notifications broadcast via the Actions described above are marshalled through a central bus,
the Dispatcher. The Dispatcher ensures that only one notification can be handled at a time; new notifications
are queued until all action handlers have finished operating for the previous notification. Stores register
their action handlers for specific notifications directly with the Dispatcher, and can specify action handler
dependencies - that is, an action handler can have its invocation delayed until the completion of other
action handlers.

##Important Note!!!
The docs below are accurate as of 0.4.3. The current master (and upcoming 0.5 release) makes the immutable support "pluggable", allowing for alternate engine implementations (e.g. ImmutableJS or Mori). Docs for this new approach are upcoming, but if you want to be on the bleeding edge, refer to the examples and tests as a guide.


###This Implementation
Facebook has not yet released their own implementation of Flux, but the JS community
has started the ideas behind the Flux architecture, most notably in @BinaryMuse's
[fluxxor](https://github.com/BinaryMuse/fluxxor). Fluxy is an implementation that
includes some differentiating features:

  * View components should be completely separated from Flux. They can intereact with Flux Stores
  and Actions via direct API calls, without coupling them to the Flux implementation.

  * Promises (via [Bluebird](https://github.com/petkaantonov/bluebird/)) drive the Dispatcher/Action system, along for the easy registration of async action handlers

  * Stores embrace immutable data, going so far as to be powered by [Mori](https://github.com/swannodette/mori), which
  provides a light convenience API around ClojureScript's data structures.


##How it Works
A Fluxy implementation will define and use three different types of service
objects: Stores, Actions, and Constants. While these three types of objects operate
in concert, their roles are very distinct from one another - in fact, a Store should
never call an Action, and an Action should never call into a Store. Instead, the Dispatcher
unifies Action and Store objects, with messages defined by Constants. (All of the details
of the Dispatch queue are hidden from the actual application implementation, so you don't need
to worry about how the communication is happening behind the scenes.)

In order to keep your application modular, there's just one rule to remember: Views issue
COMMANDS to Actions, and QUERIES to Stores.

That means that *any* updates to application state should be routed through an Action, and never via
a direct call from a view into a Store.

###Actions
Actions can be considered command objects. They are called directly by view components.
They trigger service updates directly, and send messages to Stores by calling `this.dispatchAction(messageName, ...args)`.

An example Action can be seen below:

```javascript
var Fluxy = require('fluxy');

var TodoConstants = require('../constants/TodoConstants');
var TodoService = require('../services/TodoService');

var TodoActions = Fluxy.createActions({
  serviceActions: {
    create: [TodoConstants.TODO_CREATE, function (text) {
      return TodoService.create(text); //returns promise
    }],
    destroy: [TodoConstants.TODO_DESTROY, function (id) {
      return TodoService.destroy(id); //returns promise
    }]
  },
  toggleExpanded: function (expandFlag) {
    this.dispatchAction(TodoConstants.TODO_TOGGLE_EXPANDED, expandFlag);
  }
});

module.exports = TodoActions;
```
The most interesting aspect to Actions is the special definition of `serviceActions`.
Because so many Fluxy behaviors amount to
the same flow - Action Message leading to a service call, which either succeeds (MESSAGE_COMPLETED) or
fails (MESSAGE_FAILED) - Fluxy defines a special type of action to reduce boilerplate. `serviceActions`
automatically wire up a promise and message dispatch queue.

Let's take the first service action defined: `create`.
That service action will define a `create(text)` method on the TodoActions singleton. Calling `create(text)` will
AUTOMATICALLY dispatch a `TODO_CREATE` message. The service action will then call the service method, and wire up
promise result and failure handlers.

All of that means, most simply, that this:
```javascript
var TodoActions = Fluxy.createActions({
  serviceActions: {
    create: [TodoConstants.TODO_CREATE, function (text) {
      return TodoService.create(text); //returns promise
    }]
  },
});
```
Is actually the same as this:
```javascript
var TodoActions = Fluxy.createActions({
  create: function (text) {
    var self = this;
    this.dispatchAction(TodoConstants.TODO_CREATE);
    TodoService.create(text)
      .then(function (result) {
        self.dispatchAction(TodoConstants.TODO_CREATE_COMPLETED, result);
      })
      .catch(function (err) {
        self.dispatchAction(TodoConstants.TODO_CREATE_FAILED, err);
      });
  }
});
```
See how much boilerplate that saved? It's like a poor dev's macro.

There's nothing preventing you from defining the `create` action in its longer form. Any methods
can be defined on an Action. `serviceActions` just make your life a little easier.


###Constants
Constants are exactly that: Enums of constants. While Constants are primarily used to define
string message names for dispatching, they can also store any constant values used by the app.

An example:
```javascript
  var Fluxy = require('fluxy');

  var TodoConstants = Fluxy.createConstants({
    serviceMessages: [
      'TODO_CREATE',
      'TODO_UPDATE_TEXT',
      'TODO_TOGGLE_COMPLETION',
      'TODO_COMPLETE_ALL',
      'TODO_DESTROY',
      'TODO_DESTROY_COMPLETED_TODOS'
    ],
    messages: ['TODO_CHANGED'],
    values: {
      MAX_TODOS: 99
    }
  });

  module.exports = TodoConstants;
```
A Constant singleton is really just an Enum - in fact, the `createConstants` call is simply deferring
to the [Enum](https://github.com/adrai/enum) constructor. `messages` and `servicesMessages` have
equivalent key and value pairs. `values` have a string key and a variable value.

`serviceMessages` perform the same helpful function as `serviceActions` above - they accomodate for
the routing call/completed/failed service flow. So each string defined in the `serviceMessages` array
actually creates three string constants. In the example above, `TodoConstants.TODO_CREATE_COMPLETED` and
`TodoConstants.TODO_CREATE_FAILED` are created in addition to `TODO_CREATE`.

`messages` create string constants as well, they just don't add the `COMPLETED` and `FAILED` pairings.

`values` can have any type of value. In the above example, `TodoConstants.MAX_TODOS.value` will equal 99.

###Stores
Stores are the heart of the Fluxy implementation. In addition to responding to message dispatches, they
manage all application state via immutable mori data structures.

An example Store implementation:
```javascript
var TodoConstants = require('../constants/TodoConstants');
var Fluxy = require('fluxy');
var $ = Fluxy.$;

var TodoStore = Fluxy.createStore({
  getInitialState: function () {
    return {
      todos: {}
    };
  },
  areAllComplete: function () {
    return $.every(function (todo) {
      return $.get(todo, 'completed') === true;
    }, $.vals(this.get('todos')));
  },
  actions: [
    [TodoConstants.TODO_CREATE_COMPLETED, function (todo) {
      this.set(['todos', todo.id.toString()], $.js_to_clj(todo));
    }],
    [TodoConstants.TODO_COMPLETE_ALL, function () {
      this.set(['todos'], function (todoMap) {
        return $.reduce_kv(
          function(acc, key, val) {
            return $.assoc(acc, key, $.assoc(val, 'complete', true));
          },
          $.hash_map(),
          todoMap
        );
      });
    }],
  ]
});
```
Stores are the most complex part of Fluxy, and require a much deeper explanation.

First, lets look at the `actions` definition. `actions` autowrite message handlers to
the dispatcher. In the example above, a `TodoStore.handleTodoCreateCompleted` function is created.
This function is automatically wired to the Fluxy Dispatcher and listens to the `TodoConstants.TODO_CREATE_COMPLETED`
message. The actual handler behavior is defined as a function in the array definition.

Also note that it's possible to create dependencies in how Stores handle dispatches. In the below example,
the defined handler is called AFTER the SessionStore handler has finished.
```javascript
  actions: [
    [UserConstants.LOGIN_COMPLETED, {waitFor: [SessionStore]}, function (user) {
      this.set('user', user);
    }],
  ]
```
And if the SessionStore handler had returned a promise, the handler above wouldn't
execute until after the promise had resolved.

You'll note the use of `$` in the Store. That's not a jQuery reference! It's a reference to the `mori`
API. You can access mori directly through `Fluxy.$`, or directly on the Store singleton - all of mori's
functions are proxied through to the Store and prefixed with a `$`. (So `Store.$equals` will proxy to mori.equals).

`getInitialState` defines the initial state of the Store. The object that's returned by the `getInitialState`
function will be cast into a ClojureScript data structure. It's accessible directly via `Store.state`, but
most of the interactions should be made through the helper API functions `get` and `set`.

`get(keyOrKeyArray)` calls directly into `Store.state`. It can be provided with a string key or an array of keys.
A string key lookup is the rough equivalent of `state.<key>`. The array lookup is much more powerful, as it allows
for "looking into" the Store state, reaching deeply into a nested data structore. For example, `get(['todos', 571, 'text'])`
is the rough equivalent of `Store.state.todos[571].text`. (Don't worry, ClojureScript won't throw an undefined error as it walks
its data structure!)

`set(keyOrArrayOfKeys, valOrFn)` is the setter equivalent of `get`. In addition to performing the same flat or deep
access that `get` provides, it can also update a value in one of two ways - either by assigning a value directly, or
as the result of an update function. In the example below...
```javascript
Store.set(['todos', 101, 'complete'], function (completeFlag) { return !completeFlag; });
```
...the state of todo 101's completion is being toggled by the update function. This notation allows for
some nice functional composition.

There are a few other benefits to using the `set` helper. First, it not only updates the Store state - it handles the storage
of the Store's existing state. That's right - the entire history of Store states is tracked in `Store.state`. That means
you can always call `Store.undo()` to rollback state. After updating the Store's state and state history, `set` will trigger
an event for any defined watchers with references to both the previous state and the new state.

In addition to `set`, there's a corresponding `setFromJS` method which automatically converts
the set value into a ClojureScript data structure (e.g. a JS object to a CLJS map). It delegates
to the underlying `Store.set` method.

Watchers are defined against the Store directly:
```javascript
Store.addWatch(function (keys, oldState, newState) {...});
```
And removed just as easily:
```javascript
Store.removeWatch(watcherFn);
```

Note the `keys` argument of the watcher handler. It's a reference to string or array of keys passed
into the `set` function. Using keys, you can easily figure out whether your watcher handler should
care about the updated state (or not).

Note that `get` by default returns the ClojureScript data structure. You can access the JS representation
either by calling `Store.getAsJS`, which behaves the same as `Store.get`, or by calling `Store.toJS(cljObj)`, which
casts the provided structure to JavaScript. Using the ClojureScript objects allows for easy tests in your `shouldComponentUpdate`
functions, but otherwise, ClojureScript objects should not be used extensively (if at all) in your view components, for risk
of tying your components too tightly to the Fluxy implementation.


###"Harness"
Stores, Actions, and Constants are all managed by a singleton Fluxy. In addition to allowing you to create
these key components of a Fluxy app, it also allows you to easily access the global application state.

`createStore`, `createActions`, and `createConstants` are all described in the respective sections above.

`start(initialState)` is the call that triggers the instantiation and injection of all Fluxy components. If you pass a
hash map into the start function, it will set the state of each store to reflect the injected map. For example,
say you have a Store with a name of `TodoStore` and call start with `{TodoStore: { todos: todosArr }}`; making
this call will start the app with the TodoStore having the todo key in its state set to the value of `todosArr`.

`bootstrap(prop, context)` is a convenience method for calling start with the
value of a window prop (or a prop on a provided context). Bootstrap is most useful for, appropriately,
bootstrapping an application's state with serialized JSON embedded in the page's HTML.

`renderStateToString(serializer)` serializes the entire graph of all Store states to a string,
with the keys of the serialization corresponding to each Store's name. While this method will
default to using a "safe" version of `JSON.stringify`, any serialization function can be provided - for example,
the `write` function from cognitect/transit-js.

`start`, `bootstrap`, and `renderStateToString` can be easily combined to power server-side rendering. Just follow
the below steps:

1. Give your stores a unique name. `Fluxy.createStore({name: 'TodoStore', //other config})`

2. Before calling `React.renderComponentToString`, make sure to call `Fluxy.start` on the server,
passing it a hash of Store initial states (keyed by Store name)

3. Make sure to bootstrap your HTML load with the state you passed to Fluxy with `Fluxy.renderStateToString`

4. Finally, in your client side code, instead of calling `Fluxy.start`, call `Fluxy.bootstrap(windowKeyOfBootstrappedData)`

---

For further details, be sure to check out the `examples` directory and the test suite.

##Roadmap to 1.0
- [x] Update generators to work with new API
- [x] Update example app to work with new API
- [x] Provide basic implementation steps in the README
- [ ] Lock down API
- [ ] Add code documentation
- [ ] Cleanup internal implementation
