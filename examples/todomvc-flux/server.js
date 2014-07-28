require('node-jsx').install();
var TodoApp = require('./js/components/TodoApp.react');

var Fluxy = require('fluxy');
var React = require('react');
var st = require('st');
var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');

var app = express();

var getAppState = function (cb) {
  fs.readFile('./db.json', 'utf8', function (err, result) {
    if (err) {
      cb(err);
    }
    else {
      cb(null, JSON.parse(result));
    }
  });
};

var getTodos = function () {
  var todos = [{
    id: Date.now(),
    text: 'Sample todo',
    complete: false
  }];
  var initialState = todos.reduce(function (acc, todo) {
    acc[todo.id] = todo;
    return acc;
  }, {});

  return initialState;
};

var renderApp = function (Fluxy) {
  var template = fs.readFileSync('./index.html', 'utf8');
  return template
    .replace('<!--app-->', React.renderComponentToString(TodoApp(null)))
    .replace('/*bootstrap*/', 'window.__fluxy__ = ' + Fluxy.renderStateToString());
};

app.use("/assets", st({
  path: __dirname + "/assets"
}));

app.get('/todo', function (req, res, next) {
  getAppState(function (err, state) {
    if (!state) {
      state = {
        TodoStore: {
          todos: getTodos()
        }
      };
    }
    Fluxy.start(state);
    res.send(renderApp(Fluxy));
  });
});

app.post('/todo', [bodyParser.json()], function (req, res, next) {
  fs.writeFile('./db.json', JSON.stringify(req.body), function (err) {
    if (err) {
      res.send(err);
    }
    else {
      res.send(200);
    }
  });
});

app.listen(3333);
console.log('dev server started on 3333');
