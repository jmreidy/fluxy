var FluxStore = require('../lib/Store');

describe('Fluxy Store', function () {
  var store;

  beforeEach(function () {

  });

  describe('action registration', function () {
    it('registers actions in the provided `actions` hash');
  });

  describe('#set', function () {
    context('when provided a function', function () {
      it('updates the store state with the provided function');
    });

    context('when provided a value', function () {
      it('updates the store state with the provided value');
    });

    it('triggers a watch event with the provided key');
    it('keeps track of the previous store state');
  });

  describe('#get', function () {
    it('exposes store state for the provided key(s)');
  });

  describe('#toJS', function () {
    it('recursively transforms the store state at the provided key point');
  });

});
