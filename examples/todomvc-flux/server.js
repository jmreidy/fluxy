require('node-jsx').install();
var TodoApp = require('./js/components/TodoApp.react');

var Fluxy = require('fluxy');
var React = require('react');
var st = require('st');
var express = require('express');
var fs = require('fs');

var app = express();

var getTodos = function (req) {
  var todos = [];
  for (var i = 0; i < 5; i++) {
    todos.push({
      id: Date.now() + i,
      text: 'Todo ' + (i+1),
      complete: (Math.random() > 0.5)
    });
  }
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
  Fluxy.start({
    TodoStore: {
      todos: getTodos(req)
    }
  });
  res.send(renderApp(Fluxy));
});

app.listen(3333);
console.log('dev server started on 3333');
