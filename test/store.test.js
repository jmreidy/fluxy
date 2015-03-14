var Fluxy = require('../index');
var FluxStore = require('../lib/Store');

var StoreTests = function (proxyTests) {
  describe('Fluxy Store', function () {
    var fluxy;
    var Proxy;

    before(function () {
      Proxy = Fluxy._Proxy;
    });

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
        it(proxyTests.getInitialState.description, function () {
          proxyTests.getInitialState.test(Store);
        });

        it('defines the initial state for the store', function () {
          var map = Proxy.fromJS({
            foo: {
              bar: 'bar'
            },
            foobar: ['a', 'b'],
            topLevel: 'flat'
          });
          expect(Proxy.equals(map, Store.state)).to.be.true;
        });
      });

      describe('#toJS', function () {
        var Store = Fluxy.createStore({});
        it('casts the provided data structure to JS', function () {
          var map = Proxy.fromJS({a: 'b'});
          expect(Store.toJS(map)).to.deep.equal({a: 'b'});
        });
      });

      describe('#set', function () {

        var itTracksStoreState = function () {
          it('keeps track of the previous store state', function () {
            Store.set(['foo', 'bar'], 'foobar');
            expect(Proxy.count(Store.states)).to.equal(2);
            expect(Proxy.getIn(Store.states, [0, 'foo', 'bar'])).to.equal('bar');
          });
        };

        var itTriggersWatch = function (key, newVal) {
          it('triggers a watch event with the provided key', function () {
            Sinon.spy(Store, '_updateState');
            var watcher = Sinon.spy();
            var oldState = Store.state;

            Store.addWatch(watcher);
            Store.set(key, newVal);

            expect(watcher).to.have.been.calledWith(key, oldState, Store.state);
            expect(watcher).to.have.been.calledAfter(Store._updateState);
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
              expect(Proxy.getIn(Store.state, ['foo', 'bar'])).to.equal('foobar');
            });

          });

          context('when provided a value', function () {

            it('updates the store state with the provided value', function () {
              Store.set(['foobar', 1], 'A');
              expect(Proxy.getIn(Store.state, ['foobar', 1])).to.equal('A');
            });

          });

        });

        context('for a string key', function () {

          itTracksStoreState();
          itTriggersWatch('topLevel', 'isFlat');

          context('when provided a function', function () {

            it('updates the store state with the provided function', function () {
              Store.set('foo', function (val) {
                return Proxy.assoc(val, 'bar', 'foobar');
              });
              expect(Proxy.getIn(Store.state, ['foo', 'bar'])).to.equal('foobar');
            });

          });

          context('when provided a value', function () {

            it('updates the store state with the provided value', function () {
              Store.set('topLevel', 'isFlat');
              expect(Proxy.get(Store.state, 'topLevel')).to.equal('isFlat');
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

      describe('#setFromJS', function () {
        it(proxyTests.setFromJS.description, function () {
          proxyTests.setFromJS.test(Store);
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

        it('notifies watchers', function () {
          var watcher = Sinon.spy();
          Store.addWatch(watcher);

          var firstState = Store.state;
          Store.set('topLevel', 1);
          var secondState = Store.state;

          Store.undo();

          expect(watcher).to.have.been.calledWith('*', secondState, firstState);
        });
      });

    });

    describe('watchers', function () {
      var Store, watcher;


      describe('#addWatch', function () {
        beforeEach(function () {
          watcher = Sinon.stub();
          Store = Fluxy.createStore({});
          Fluxy.start();
        });

        it('adds a watcher', function () {
          Store.addWatch(watcher);
          expect(Store.watchers).to.include(watcher);
        });

      });

      describe('#removeWatch', function () {
        beforeEach(function () {
          watcher = Sinon.stub();
          Store = Fluxy.createStore({});
          Fluxy.start();
          Store.addWatch(watcher);
        });

        it('removes a watcher', function () {
          Store.removeWatch(watcher);
          expect(Store.watchers).to.not.include(watcher);
        });

        it('does not call the removed watcher on set', function () {
          Store.removeWatch(watcher);
          Store.set('foo', 'bar');
          expect(watcher.callCount).to.equal(0);
        });
      });
    });


    it('can be named with a string', function () {
      var Store = Fluxy.createStore({name: 'TestStore'});
      expect(Store.name).to.equal('TestStore');
    });



  });
};

describe('Using Mori', function () {
  var mori = require('mori'),
      MoriProxy = require('../lib/collections/MoriProxy');

  before(function () {
    Fluxy.setCollectionProxyType(MoriProxy);
  });

  StoreTests({
    getInitialState: {
      description: 'specifies intial store state as Clojure data structure',
      test: function (Store) {
        expect(mori.is_map(Store.state)).to.equal.true;
      }
    },
    setFromJS: {
      description: 'casts the set value into CLJS',
      test:function (Store) {
        Store.setFromJS('foo.jsVal', {isJS: true});

        expect(mori.is_map(Store.get('foo.jsVal'))).to.be.true;
      }
    }
  });

  describe('the proxied collection functionality', function () {
    it('is exposed on Fluxy.$', function () {
       expect(Fluxy.$.equals).to.equal(mori.equals);
    });
  });
});

describe('Using Immutable', function () {
  var Immutable = require('immutable'),
      ImmutableProxy = require('../lib/collections/ImmutableProxy');

  before(function () {
    Fluxy.setCollectionProxyType(ImmutableProxy);
  });

  StoreTests({
    getInitialState: {
      description: 'specifies intial store state as Immutable.js data structure',
      test: function (Store) {
        expect(Immutable.Map.isMap(Store.state)).to.equal.true;
      }
    },
    setFromJS: {
      description: 'casts the set value into a Immutable.js structure',
      test:function (Store) {
        Store.setFromJS('foo.jsVal', {isJS: true});

        expect(Immutable.Map.isMap(Store.get('foo.jsVal'))).to.be.true;
      }
    }
  });

  describe('the proxied collection functionality', function () {
    it('is exposed on Fluxy.$', function () {
       expect(Fluxy.$.is).to.equal(Immutable.is);
    });
  });
});
