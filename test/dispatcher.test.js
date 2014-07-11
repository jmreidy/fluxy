var Promise = require('bluebird');
var Dispatcher = require('../lib/Dispatcher');

describe('Fluxy Dispatcher', function () {
  var dispatcher;

  beforeEach(function () {
    dispatcher = new Dispatcher();
  });

  describe('#dispatchAction', function () {

    it('should execute registered actions', function () {
      var results = [];

      var dispatcher = new Dispatcher();
      dispatcher.registerAction('foo', function (payload) {
        results.push('a');
      });
      dispatcher.registerAction('foo', function (payload) {
        results.push('b');
        expect(results).to.deep.equal(['a', 'b']);
      });
      dispatcher.dispatchAction('foo');
    });

    it('should pass the payload to registered actions', function () {
      var testPayload = 'abc';
      dispatcher.registerAction('foo', function (payload) {
        expect(payload).to.equal(testPayload);
      });
      dispatcher.dispatchAction('foo', testPayload);
    });

    it('should execute registered async actions', function () {
      var results = [];

      var testPayload = 'abc';
      dispatcher.registerAction('foo', function (payload) {
        var token = Promise.defer();
        var promise = token.promise.then(function () {
          results.push('a');
          expect(results).to.include('a');
          expect(results).to.include('b');
        });
        setTimeout(function () { token.resolve(); }, 200);
        return promise;
      });
      dispatcher.registerAction('foo', function (payload) {
        results.push('b');
      });
      dispatcher.dispatchAction('foo', testPayload);
    });
  });

  describe('#registerAction', function () {
    it('should respect the order of registered actions', function () {
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
        expect(results[3]).to.equal('d');
      });
      dispatcher.dispatchAction('foo');
      dispatcher.dispatchAction('bar');
      dispatcher.dispatchAction('foobar');
    });

    it('should allow for specifying action dependencies', function () {
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
            expect(payload).to.equal(testPayload);
            expect(results).to.deep.equal(['a', 'b', 'c']);
          }
      );
      dispatcher.dispatchAction('foo', testPayload);
    });
  });
});
