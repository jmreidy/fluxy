var Immutable = require('immutable');

module.exports = {
  Interface: Immutable,
  get: function (obj, strKey) {
    return obj.get(strKey);
  },
  getIn: function (obj, keys) {
    return obj.getIn(keys);
  },
  updateIn: function (coll, keys, value) {
    return coll.updateIn(keys, value);
  },
  assoc: function (map, key, value) {
    return map.set(key, value);
  },
  assocIn: function (map, keys, value) {
    return map.setIn(keys, value);
  },
  toJS:  function (value) {
    if (value.toJS) {
      return value.toJS();
    }
    else {
      return value;
    }
  },
  fromJS: function (value) {
    return Immutable.fromJS(value);
  },
  toVector: function (target) {
    return Immutable.List.of(target);
  },
  conj: function (target, value) {
    return target.push(value);
  },
  count: function (coll) {
    return coll.size;
  },
  pop: function (coll) {
    return coll.pop();
  },
  peek: function (coll) {
    return coll.last();
  },
  equals: function (a, b) {
    return (Immutable.is(a, b) === true);
  }
};
