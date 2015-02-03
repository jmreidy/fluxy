var mori = require('mori');

module.exports = {
  displayName: 'mori',
  Interface: mori,
  get: function (obj, strKey) {
    return mori.get(obj, strKey);
  },
  getIn: function (obj, keys) {
    return mori.get_in(obj, keys);
  },
  updateIn: function (coll, keys, value) {
    return mori.update_in(coll, keys, value);
  },
  assoc: function (map, key, value) {
    return mori.assoc(map, key, value);
  },
  assocIn: function (map, keys, value) {
    return mori.assoc_in(map, keys, value);
  },
  toJS:  function (value) {
    return mori.clj_to_js(value);
  },
  fromJS: function (value) {
    return mori.js_to_clj(value);
  },
  toVector: function (target) {
    return mori.vector(target);
  },
  conj: function (target, value) {
    return mori.conj(target, value);
  },
  count: function (coll) {
    return mori.count(coll);
  },
  pop: function (coll) {
    return mori.pop(coll);
  },
  peek: function (coll) {
    return mori.peek(coll);
  },
  equals: function (a, b) {
    return mori.equals(a, b);
  }
};
