var test = require('tape');
var extend = require('lodash-node/modern/objects/assign');
var FluxStore = require('../lib/Store');

var handlerFn = function () {
}
handlerFn.bind = function () {
  return handlerFn;
}

var setupStore = function () {
  var flux = {
    registrations: [],
    registerAction: function (action, handler) {
      this.registrations.push([action, handler]);
    },
    regsiterDeferedAction: function (action, waitFor, handler) {
      this.registrations.push([action, handler]);
    }
  };
  var Store = function () {
    FluxStore.call(this);
  };
  FluxStore.extend(Store, {
    getInitialState: function () {
      return {initialFoo: 'initialBar'}
    },
    testFn: function () {
      return true;
    },
    actions: {
      "handleFoo": ["FOO_ACTION", handlerFn]
    }
  });
  var store = new Store();
  store.mount(flux);
  return store;
}

test('Prototype chain is correctly setup via #extend', function (t) {
  t.plan(4);
  var store = setupStore();
  t.ok(store.get);
  t.ok(store.set);
  t.ok(store.on);
  t.ok(store.testFn());
});

test('Property values can be set and accessed', function (t) {
  t.plan(1);
  var store = setupStore();
  store.set('foo', 1);
  t.equal(store.get('foo'), 1);
});

test('Property values can be deeply set and accessed', function (t) {
  t.plan(1);
  var store = setupStore();
  store.set('foo.bar', 1);
  t.equal(store.get('foo.bar'), 1);
});

test('Property values can be updated', function (t) {
  t.plan(2);
  var store = setupStore();
  store.set('baz', 10);
  store.set('foo.bar', 100);
  store.update('baz', function (val) {
    return val+1;
  });
  store.update('foo.bar', function (val) {
    return val+1;
  });
  t.equal(store.get('baz'), 11);
  t.equal(store.get('foo.bar'), 101);
});

test('Setting property values emits a "changed" event', function (t) {
  t.plan(2);
  var store = setupStore();
  store.on('changed:baz', function () {
    t.ok(true);
  })
  store.on('changed:foo:bar', function () {
    t.ok(true);
  })
  store.set('baz', 1);
  store.set('foo.bar', 1);
});

test('State can be rolled back', function (t) {
  t.plan(3);
  var store = setupStore();
  store.set('foo.bar', 1);
  store.set('foo.bar', 2);
  t.equal(store.get('foo.bar'), 2);

  store.undo();
  t.equal(store.get('foo.bar'), 1);

  store.undo();
  t.equal(store.get('foo.bar'), null);
});

test('Initial state can be specified via getInitialState', function (t) {
  t.plan(1);
  var store = setupStore();
  t.equal(store.get('initialFoo'), 'initialBar');
});

test('Actions are assigned to a dispatcher', function (t) {
  t.plan(3);
  var store = setupStore();
  var registrations = store.getFlux().registrations;

  t.equal(registrations.length, 1);
  t.equal(registrations[0][0], 'FOO_ACTION');
  t.equal(registrations[0][1], handlerFn);
});

test('Store exposes mori methods statically', function (t) {
  t.plan(2);

  var a = FluxStore.vector(1, 2);
  var b = FluxStore.vector(1);

  t.equals(FluxStore.inc(1), 2);
  t.ok(FluxStore.equals(FluxStore.conj(b, 2), a));
});
