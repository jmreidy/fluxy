var convertName = require('../lib/convertName');

describe('convert name util', function () {

  it('converts all-caps underscore notation to camelcase', function () {
    expect(convertName('THIS_IS_A_TEST')).to.equal('thisIsATest');
  });

});
