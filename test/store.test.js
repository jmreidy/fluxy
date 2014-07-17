var Fluxy = require('../index');
var FluxStore = require('../lib/Store');
var mori = require('mori');

describe('Fluxy Store', function () {
  var fluxy;

  afterEach(function () {
    Fluxy.reset();
  });

  describe('action registration', function () {
    var Store, SecondStore;
    var ActionHandler = Sinon.stub();
    var FirstHandler = Sinon.stub();
    var SecondHandler = Sinon.stub();
    var Constants = Fluxy.createConstants({
      messages: ['TEST', 'LONGER_TEST']
    });

    beforeEach(function () {
      Store = Fluxy.createStore({
        actions: [
          [Constants.TEST, ActionHandler],
          [Constants.LONGER_TEST, FirstHandler]
        ]
      });

      SecondStore = Fluxy.createStore({
        actions: [
          [ Constants.LONGER_TEST,
            {waitFor: Store},
            SecondHandler ]
        ]
      });

      fluxy = Fluxy.start();
    });

    it('registers actions in the provided `actions` hash', function () {
      fluxy.dispatchAction(Constants.TEST, 'foo', 'bar');

      expect(ActionHandler).to.have.been.calledOnce;
      expect(ActionHandler).to.have.been.calledOn(Store);
      expect(ActionHandler).to.have.been.calledWith('foo', 'bar');
    });

    it('defines the handlers on the Store', function () {
      expect(Store.handleTest).to.exist;
      expect(Store.handleLongerTest).to.exist;
    });

    it('can specify actions to wait for', function () {
      fluxy.dispatchAction(Constants.LONGER_TEST);

      expect(FirstHandler).to.be.calledBefore(SecondHandler);
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

      var itTracksStoreState = function () {
        it('keeps track of the previous store state', function () {
          Store.set(['foo', 'bar'], 'foobar');
          expect(mori.count(Store.states)).to.equal(2);
          expect(mori.get_in(Store.states, [0, 'foo', 'bar'])).to.equal('bar');
        });
      };

      var itTriggersWatch = function (key, newVal) {
        it('triggers a watch event with the provided key', function () {
          var watcher = Sinon.spy();
          var oldState = Store.state;

          Store.addWatch(watcher);
          Store.set(key, newVal);

          expect(watcher).to.have.been.calledWith(key, oldState, Store.state);
        });
      };

      context('for an array key', function () {

        itTracksStoreState();
        itTriggersWatch(['foo', 'bar'], 'foobar');

        context('when provided a function', function () {

          it('updates the store state with the provided function', function () {
            Store.set(['foo', 'bar'], function (val) {
              return 'foobar';
            });
            expect(mori.get_in(Store.state, ['foo', 'bar'])).to.equal('foobar');
          });

        });

        context('when provided a value', function () {

          it('updates the store state with the provided value', function () {
            Store.set(['foobar', 1], 'A');
            expect(mori.get_in(Store.state, ['foobar', 1])).to.equal('A');
          });

        });

      });

      context('for a string key', function () {

        itTracksStoreState();
        itTriggersWatch('topLevel', 'isFlat');

        context('when provided a function', function () {

          it('updates the store state with the provided function', function () {
            Store.set('foo', function (val) {
              return mori.assoc(val, 'bar', 'foobar');
            });
            expect(mori.get_in(Store.state, ['foo', 'bar'])).to.equal('foobar');
          });

        });

        context('when provided a value', function () {

          it('updates the store state with the provided value', function () {
            Store.set('topLevel', 'isFlat');
            expect(mori.get(Store.state, 'topLevel')).to.equal('isFlat');
          });

        });

      });
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

    describe('#undo', function () {
      it('rolls the store back to previous state', function () {
        Store.set('topLevel', 1);
        Store.set('topLevel', 2);
        Store.undo();

        expect(Store.get('topLevel')).to.equal(1);
      });

      it('will revert to initial state if entirely rolled back', function () {
        Store.set('topLevel', 1);
        Store.undo();
        Store.undo();

        expect(Store.get('topLevel')).to.equal('flat');
      });
    });

  });

  describe('watchers', function () {
    var Store = Fluxy.createStore({});
    var watcher = Sinon.stub();

    describe('#addWatch', function () {
      it('adds a watcher', function () {
        Store.addWatch(watcher);
        expect(Store.watchers).to.include(watcher);
      });

    });

    describe('#removeWatch', function () {
      it('removes a watcher', function () {
        Store.addWatch(watcher);
        Store.removeWatch(watcher);
        expect(Store.watchers).to.not.include(watcher);
      });
    });
  });

  describe('#toJS', function () {
    var Store = Fluxy.createStore({});
    it('casts the provided data structure to JS', function () {
      var map = mori.js_to_clj({a: 'b'});
      expect(Store.toJS(map)).to.deep.equal({a: 'b'});
    });
  });

  it('exposes mori functionality', function () {
    var Store = Fluxy.createStore({});
    expect(Store.$equals).to.equal(mori.equals);
  });


});
