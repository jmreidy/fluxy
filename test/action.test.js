var Fluxy = require('../index');
var Promise = require('bluebird');

describe.only('Fluxy Actions', function () {
  var TestActions;
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

      actions: [


      ]
    });
    Fluxy.start();
    Sinon.spy(TestActions, 'dispatchAction');
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
  });

  describe('#dispatchAction', function () {
    it('dispatches the action through the Fluxy dispatcher');
  });

});
