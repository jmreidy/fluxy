var Fluxy = require('../index');
describe('Fluxy Constants', function () {
  describe('messages', function () {
    var Constants;

    beforeEach(function () {
      constants = Fluxy.createConstants({
        messages: ['A', 'B']
      });
    });

    it('registers the provided string as a constant', function () {
      expect(constants.A).to.exist;
      expect(constants.B).to.exist;
    });
  });

  describe('service messages', function () {
    var Constants;

    beforeEach(function () {
      constants = Fluxy.createConstants({
        serviceMessages: ['ADD_TODO']
      });
    });

    it('registers the provided string as a constant', function () {
      expect(constants.ADD_TODO).to.exist;
    });

    it('registers message_COMPLETED as a constant', function () {
      expect(constants.ADD_TODO_COMPLETED).to.exist;
    });

    it('registers message_FAILED as a constant', function () {
      expect(constants.ADD_TODO_FAILED).to.exist;
    });
  });

  describe('values', function () {
    var Constants;

    beforeEach(function () {
      constants = Fluxy.createConstants({
        values: {
          'TEST': 1
        }
      });
    });

    it('registers the value as a constant with the provided string key', function () {
      expect(constants.TEST.value).to.equal(1);
    });
  });

});

