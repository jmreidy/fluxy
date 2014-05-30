var test = require('tape');
var Promise = require('bluebird');
var Dispatcher = require('../lib/Dispatcher');

test('Registered actions are executed on dispatch', function (t) {
  t.plan(1);
  var results = [];

  var dispatcher = new Dispatcher();
  dispatcher.registerAction('foo', function (payload) {
    results.push('a');
  });
  dispatcher.registerAction('foo', function (payload) {
    results.push('b');
    t.deepEquals(results, ['a', 'b']);
  });
  dispatcher.dispatchAction('foo');
});

test('Registered actions receive a payload', function (t) {
  t.plan(1);

  var dispatcher = new Dispatcher();
  var testPayload = 'abc';
  dispatcher.registerAction('foo', function (payload) {
    t.equal(payload, testPayload);
  });
  dispatcher.dispatchAction('foo', testPayload);
});

test('Registered async actions are executed', function (t) {
  t.plan(3);
  var results = [];

  var dispatcher = new Dispatcher();
  var testPayload = 'abc';
  dispatcher.registerAction('foo', function (payload) {
    var token = Promise.defer();
    var promise = token.promise.then(function () {
      t.equal(payload, testPayload);
      results.push('a');
      t.ok(results.indexOf('a') > -1);
      t.ok(results.indexOf('b') > -1);
    });
    setTimeout(function () { token.resolve(); }, 200);
    return promise;
  });
  dispatcher.registerAction('foo', function (payload) {
    results.push('b');
  });
  dispatcher.dispatchAction('foo', testPayload);
});


test('Dispatched actions are handled in order', function (t) {
  t.plan(1);
  var results = [];

  var dispatcher = new Dispatcher();
  dispatcher.registerAction('foo', function (payload) {
    var token = Promise.defer();
    var promise = token.promise.then(function () {
      results.push('a');
    });
    setTimeout(function () { token.resolve(); }, 200);
    return promise;
  });
  dispatcher.registerAction('foo', function (payload) {
    results.push('b');
  });
  dispatcher.registerAction('bar', function (payload) {
    results.push('c');
  });
  dispatcher.registerAction('foobar', function (payload) {
    results.push('d');
    t.equals(results[3], 'd');
  });
  dispatcher.dispatchAction('foo');
  dispatcher.dispatchAction('bar');
  dispatcher.dispatchAction('foobar');
});


test('Action dependencies can be specified', function (t) {
  t.plan(2);
  var results = [];

  var dispatcher = new Dispatcher();
  var testPayload = 'abc';

  var StoreA = {
    handleFoo: dispatcher.registerAction('foo', function (payload) {
      var token = Promise.defer();
      var promise = token.promise.then(function () {
        results.push('a');
      });
      setTimeout(function () { token.resolve(); }, 200);
      return promise;
    })
  };
  var StoreB = {
    handleFoo: dispatcher.registerAction('foo', function (payload) {
      var token = Promise.defer();
      var promise = token.promise.then(function () {
        results.push('b');
      });
      setTimeout(function () { token.resolve(); }, 200);
      return promise;
    })
  };
  dispatcher.registerDeferedAction('foo', [StoreA.handleFoo, StoreB.handleFoo],
      function (payload) {
        results.push('c');
        t.equal(payload, testPayload);
        t.deepEquals(results, ['a', 'b', 'c']);
      }
  )
  dispatcher.dispatchAction('foo', testPayload);
});






