var Sinon = require('sinon');
var Store = require('../lib/Store');
var Action = require('../lib/Action');

describe('Fluxy', function () {
  var Fluxy = proxyquire('../index', {});

  //createStore, createActions, and createConstants tested further in
  //their own unit tests
  describe('.createStore', function () {
    it('creates and returns a Fluxy Store instance', function () {
      expect(Fluxy.createStore({})).to.be.an.instanceOf(Store);
    });
  });

  describe('.createActions', function () {
    it('creates and returns a Fluxy Action instance', function () {
      expect(Fluxy.createActions({})).to.be.an.instanceOf(Action);
    });
  });

  describe('.createConstants', function () {
    it('creates and returns a Fluxy Constants instance', function () {
      expect(Fluxy.createConstants({})).to.be.an.instanceOf(require('enum'));
    });
  });

  describe('.start', function () {
    var fluxy, store, action, Dispatcher, Fluxy;

    beforeEach(function () {
      Dispatcher = Sinon.spy(require('../lib/Dispatcher'));
      Fluxy = proxyquire('../index', {
        './lib/Dispatcher': Sinon.spy(Dispatcher)
      });

      store = Fluxy.createStore({});
      Sinon.spy(store, 'mount');

      action = Fluxy.createActions({});
      Sinon.spy(action, 'mount');
    });

    it('instantiates a new instance of Fluxy', function () {
      fluxy = Fluxy.start();

      expect(fluxy).to.be.an.instanceOf(Fluxy);
      expect(Dispatcher).to.have.been.calledWithNew;
    });

    it('mounts all registered Stores', function () {
      fluxy = Fluxy.start();

      expect(store.mount).to.have.been.calledOnce;
      expect(store.mount).to.have.been.calledWith(fluxy);
    });

    it('mounts all registered Actions', function () {
      fluxy = Fluxy.start();

      expect(action.mount).to.have.been.calledOnce;
      expect(action.mount).to.have.been.calledWith(fluxy);
    });

    context('when passed an object', function () {
      var namedStore;
      beforeEach(function () {
        namedStore= Fluxy.createStore({name: 'NamedStore'});
        fluxy = Fluxy.start({
          NamedStore: {
            foo: 'bar'
          }
        });
      });

      it('sets data on mounted stores', function () {
        expect(namedStore.get('foo')).to.equal('bar');
      });
    });
  });

  describe('it exposes mori', function () {
    expect(Fluxy.$).to.equal(require('mori'));
  });

});
