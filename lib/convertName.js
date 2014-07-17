module.exports = function (name) {
  name = name.toLowerCase();
  name = name.replace(/_(\w{1})/g, function (match, letter, word) {
    return letter.toUpperCase();
  });
  return name;
};
