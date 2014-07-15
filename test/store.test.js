var Fluxy = require('../index');
var FluxStore = require('../lib/Store');
var mori = require('mori');

describe.only('Fluxy Store', function () {
  var fluxy;

  afterEach(function () {
    Fluxy.reset();
  });

  describe('action registration', function () {
    var Store;
    var ActionHandler = Sinon.stub();
    var Constants = Fluxy.createConstants({
      messages: ['TEST']
    });

    beforeEach(function () {
      Store = Fluxy.createStore({
        actions: [
          [Constants.TEST, ActionHandler]
        ]
      });

      fluxy = Fluxy.start();
    });

    it('registers actions in the provided `actions` hash', function () {
      fluxy.dispatchAction(Constants.TEST, 'foo');
      expect(ActionHandler).to.have.been.calledOnce;
      expect(ActionHandler).to.have.been.calledWith('foo');
    });
  });

  describe('state handling', function () {
    var Store;

    beforeEach(function () {
      Store = Fluxy.createStore({
        getInitialState: function () {
          return {
            foo: {
              bar: 'bar'
            },
            foobar: ['a', 'b'],
            topLevel: 'flat'
          };
        }
      });
      Fluxy.start();
    });

    describe('#getInitialState', function () {
      it('specifies intial store state as Clojure data structure', function () {
        expect(mori.is_map(Store.state)).to.equal.true;
      });

      it('defines the initial state for the store', function () {
        var map = mori.js_to_clj({
          foo: {
            bar: 'bar'
          },
          foobar: ['a', 'b'],
          topLevel: 'flat'
        });
        expect(mori.equals(map, Store.state)).to.be.true;
      });
    });

    describe('#set', function () {
      context('when provided a function', function () {
        it('updates the store state with the provided function');
      });

      context('when provided a value', function () {
        context('for a string key', function () {
          it('updates the store state with the provided value');
        });

        context('for an array key', function () {
          it('updates the store state with the provided value');
        });
      });

      it('triggers a watch event with the provided key');
      it('keeps track of the previous store state');
    });

    describe('#get', function () {

      context('when passed a string', function () {
        it('exposes store state for the provided key', function () {
          expect(Store.get('topLevel')).to.equal('flat');
        });
      });

      context('when passed an array', function () {
        context('for nested hashes', function () {
          it('exposes store state for the provided key(s)', function () {
            expect(Store.get(['foo', 'bar'])).to.equal('bar');
          });
        });

        context('for arrays/vectors', function () {
          it('exposes store state for the provided key(s)', function () {
            expect(Store.get(['foobar', 1])).to.equal('b');
          });
        });
      });
    });

    describe('#getAsJS', function () {
      it('casts get results into JS', function () {
        expect(Store.getAsJS('foo')).to.deep.equal({bar: 'bar'});
        expect(Store.getAsJS('foobar')).to.deep.equal(['a', 'b']);
        expect(Store.getAsJS('topLevel')).to.equal('flat');
      });

    });
  });

});
