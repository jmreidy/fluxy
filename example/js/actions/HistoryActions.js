var ReactRouter = require('react-router');

var Flux = require('../../../index');

module.exports = Flux.createActions({
  redirectTo: function (url, params) {
    ReactRouter.replace(url, (params || {}));
  },
  navigateTo: function (url, params) {
    ReactRouter.transitionTo(url, (params || {}));
  }
});
