var Fluxy = require('../index');
var Promise = require('bluebird');
var Dispatcher = require('../lib/Dispatcher');

describe('Fluxy Actions', function () {
  var TestActions, fluxy;
  var testSpy = Sinon.stub();
  var Constants = Fluxy.createConstants({
    serviceMessages: ['TEST', 'FAIL_EXAMPLE']
  });

  beforeEach(function () {
    TestActions = Fluxy.createActions({
      serviceActions: [
        [Constants.TEST, function (result) {
          var token = Promise.defer();
          token.resolve('resolved');
          return token.promise;
        }],
        [Constants.FAIL_EXAMPLE, function () {
          var token = Promise.defer();
          token.reject('failed');
          return token.promise;
        }]
      ],
      testAction: testSpy
    });
    fluxy = Fluxy.start();
    Sinon.spy(TestActions, 'dispatchAction');
  });

  afterEach(function () {
    Fluxy.reset();
  });

  describe('service actions', function () {

    it('registers an action handler against the provided Constant', function (done) {
      TestActions.test('arg1', 'arg2').then(function () {
        expect(TestActions.dispatchAction).to.have.been.calledWith(Constants.TEST.value, 'arg1', 'arg2');
        done();
      })
      .catch(done);
    });

    it('hooks up the handler for Constant_COMPLETED', function (done) {
      TestActions.test('arg1', 'arg2').then(function () {
        expect(TestActions.dispatchAction).to.have.been.calledWith(Constants.TEST_COMPLETED.value, {payload: 'resolved'});
        done();
      })
      .catch(done);
    });

    it('hooks up the handler for Constant_FAILED', function (done) {
      TestActions.failExample().then(function () {
        expect(TestActions.dispatchAction).to.have.been.calledWith(Constants.FAIL_EXAMPLE_FAILED.value, {error: 'failed'});
        done();
      })
      .catch(done);
    });

    context('when specifying an action with a duplicate name', function () {

      beforeEach(function () {
        TestActions = Fluxy.createActions({
          serviceActions: [
            [Constants.TEST, function (result) {
              var token = Promise.defer();
              token.resolve('resolved');
              return token.promise;
            }],
          ],

          test: testSpy
        });
      });

      it('throws an error', function () {
        expect(Fluxy.start).to.throw('Cannot assign duplicate function name "test"');
      });
    });
  });

  describe('normal actions', function () {

    it('assigns action names as methods', function () {
      TestActions.testAction();
      expect(testSpy).to.have.been.calledOnce;
    });

  });

  describe('#dispatchAction', function () {

    beforeEach(function () {
      Sinon.spy(Dispatcher.prototype, 'dispatchAction');
    });

    afterEach(function () {
      Dispatcher.prototype.dispatchAction.restore();
    });

    it('dispatches the action through the Fluxy dispatcher', function () {
      TestActions.dispatchAction('foo', 1);
      expect(Dispatcher.prototype.dispatchAction).to.have.been.calledWith('foo', 1);
    });
  });

});
