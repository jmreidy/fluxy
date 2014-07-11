var chai = require('chai');
var proxyquire = require('proxyquire');

global.expect = chai.expect;
global.Sinon = require('sinon');
global.proxyquire = function (path, opts) {
  if (path.match(/^\./)) {
    path = '../'+path;
  }
  return proxyquire(path, opts);
};

chai.use(require('sinon-chai'));
