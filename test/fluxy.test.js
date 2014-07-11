var Sinon = require('sinon');
var Store = require('../lib/Store');
var Action = require('../lib/Action');

describe('Fluxy', function () {
  var Fluxy = proxyquire('../index', {});

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

      fluxy = Fluxy.start();
    });

    it('instantiates a new instance of Fluxy', function () {
      expect(fluxy).to.be.an.instanceOf(Fluxy);
      expect(Dispatcher).to.have.been.calledWithNew;
    });

    it('mounts all registered Stores', function () {
      expect(store.mount).to.have.been.calledOnce;
      expect(store.mount).to.have.been.calledWith(fluxy);
    });

    it('mounts all registered Actions', function () {
      expect(action.mount).to.have.been.calledOnce;
      expect(action.mount).to.have.been.calledWith(fluxy);
    });

  });

});
