var express = require('express');
var st = require('st');

var app = express();

app.use("/assets", st({
  path: __dirname + "/assets"
}));

app.get('*', function(req, res, next) {
  res.sendfile('./index.html');
});

app.listen(4000);
console.log('dev server started on 4000');
