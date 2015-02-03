var _proxy;
var _proxyType;

function applyProxyFn(fn, args) {
  if (_proxy && _proxy[fn]) {
    return _proxy[fn].apply(null, args);
  }
}

module.exports = {
  _setProxyType: function (type) {
    var Proxy = type;

    if (!Proxy || typeof Proxy !== 'object') {
      throw new Error('Proxy implementation should be an object');
    }

    console.log('Setting proxy type', Proxy.displayName);

    _proxy = Proxy;
    _proxyType = Proxy.displayName;

    return Proxy.Interface;
  },

  get: function () { return applyProxyFn('get', arguments); },
  getIn: function () { return applyProxyFn('getIn', arguments); },
  updateIn: function () { return applyProxyFn('updateIn', arguments); },
  assoc: function () { return applyProxyFn('assoc', arguments); },
  assocIn: function () { return applyProxyFn('assocIn', arguments); },
  toJS: function () { return applyProxyFn('toJS', arguments); },
  fromJS: function () { return applyProxyFn('fromJS', arguments); },
  toVector: function () { return applyProxyFn('toVector', arguments); },
  conj: function () { return applyProxyFn('conj', arguments); },
  count: function () { return applyProxyFn('count', arguments); },
  pop: function () { return applyProxyFn('pop', arguments); },
  peek: function () { return applyProxyFn('peek', arguments); },
  equals: function () { return applyProxyFn('equals', arguments); }
};
