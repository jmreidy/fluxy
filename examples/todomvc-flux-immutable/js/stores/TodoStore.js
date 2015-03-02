/**
 * Copyright 2013-2014 Justin Reidy
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * TodoStore
 */

var TodoConstants = require('../constants/TodoConstants');
var Fluxy = require('fluxy');
var $ = Fluxy.$;

var TodoStore = Fluxy.createStore({
  name: 'TodoStore',
  getInitialState: function () {
    //we're using a hash for todos b/c the Facebook base example does.
    //With mori, a vector might make more sense.
    //With Immutable, a List might make more sense.
    return $.Map();
  },
  areAllComplete: function () {
    return this.state.every(function (todo) {
      return todo.get('complete') === true;
    });
  },
  actions: [
    [TodoConstants.TODO_CREATE_COMPLETED, function (todo) {
      this.setFromJS(todo.id, todo);
    }],
    [TodoConstants.TODO_CREATE_FAILED, function (err) {
      //if we'd updated optimistically by handling TodoConstants.TODO_CREATE,
      //we could remove the optimistic update here
    }],

    //the rest of these are "optimistic" - they're occurring before service results
    //that is, they're responding to the base serviceMessage
    //instead of _COMPLETED or _FAILED messages
    [TodoConstants.TODO_UPDATE_TEXT, function (id, text) {
      this.setFromJS([id, 'text'], text);
    }],
    [TodoConstants.TODO_TOGGLE_COMPLETION, function (id) {
      this.setFromJS([id, 'complete'], function (complete) {
        return !complete;
      });
    }],
    [TodoConstants.TODO_COMPLETE_ALL, function () {
      this.set(null, this.state.map(function (todo) {
        if (!todo.get('complete')) {
          return todo.set('complete', true);
        } else {
          return todo;
        }
      }));
    }],
    [TodoConstants.TODO_DESTROY, function (id) {
      this.set(null, this.state.delete(id));
    }],
    [TodoConstants.TODO_DESTROY_COMPLETED_TODOS, function () {
      this.set(null, this.state.filter(function (todo) {
        return !todo.get('complete');
      }));
    }],
    [TodoConstants.TODO_UNDO, function () {
      this.undo();
    }]
  ]
});

module.exports = TodoStore;
