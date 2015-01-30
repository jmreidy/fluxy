var ProxyMap = {
  mori: function () {
    return require('./MoriProxy');
  },
  immutable: function () {
    return require('./ImmutableProxy');
  }
};

var _proxy;
var _proxyType;

function applyProxyFn (fn, args) {
  if (_proxy && _proxy[fn]) {
    var result = _proxy[fn].apply(null, args);
    return result;
  }
}

module.exports = {
  test: function () { return _proxyType; },
  _setProxyType: function (type) {
    console.log('setting proxy type', type);
    _proxy = undefined;
    _proxyType = type;
    var interface;
    var Proxy = ProxyMap[_proxyType];
    if (Proxy) {
      _proxy = Proxy();
      interface = _proxy.Interface;
    }
    return interface;
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
