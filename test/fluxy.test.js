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

  describe('.renderStateToString', function () {
      beforeEach(function () {
        Fluxy.createStore({name: 'NamedStore'});
        Fluxy.createStore({name: 'SecondStore'});
        fluxy = Fluxy.start({
          NamedStore: {
            foo: 'bar',
            date: new Date()
          },
          SecondStore: {
            unsafe: '</script>',
            prop: '<!--inject!-->'
          }
        });
      });

      it('renders fluxy state as a JSON string', function () {
        var state = Fluxy.renderStateToString();

        expect(state).to.be.a('string');

        state = JSON.parse(state);
        expect(state.NamedStore.foo).to.equal('bar');
      });


      it('protects again script injection', function () {
        var state = Fluxy.renderStateToString();

        state = JSON.parse(state);
        expect(state.SecondStore.unsafe).to.equal('<\\/script>');
        expect(state.SecondStore.prop).to.equal('<\\!--inject!-->');
      });

      it('allows for the use of a custom serializer', function () {
        var transit = require('transit-js');
        var writer = transit.writer('json-verbose');
        var state = Fluxy.renderStateToString(writer.write.bind(writer));

        expect(state).to.be.a('string');
        state = transit.reader('json-verbose').read(state);
        expect(state.get('NamedStore').get('date')).to.be.an.instanceOf(Date);
      });
  });

  describe('it exposes mori', function () {
    expect(Fluxy.$).to.equal(require('mori'));
  });

});
