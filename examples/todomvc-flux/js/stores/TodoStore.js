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
    return {
      todos: {}
    };
  },
  areAllComplete: function () {
    return $.every(function (todo) {
      return $.get(todo, 'completed') === true;
    }, $.vals(this.get('todos')));
  },
  actions: [
    [TodoConstants.TODO_CREATE_COMPLETED, function (todo) {
      this.set(['todos', todo.id.toString()], $.js_to_clj(todo));
    }],
    [TodoConstants.TODO_CREATE_FAILED, function (err) {
      //if we'd updated optimistically by handling TodoConstants.TODO_CREATE,
      //we could remove the optimistic update here
    }],

    //the rest of these are "optimistic" - they're occurring before service results
    //that is, they're responding to the base serviceMessage
    //instead of _COMPLETED or _FAILED messages
    [TodoConstants.TODO_UPDATE_TEXT, function (id, text) {
      this.set(['todos', id.toString(), 'text'], text);
    }],
    [TodoConstants.TODO_TOGGLE_COMPLETION, function (id) {
      this.set(['todos', id.toString(), 'complete'], function (completed) {
        return !completed;
      });
    }],
    [TodoConstants.TODO_COMPLETE_ALL, function () {
      this.set(['todos'], function (todoMap) {
        return $.reduce_kv(
          function(acc, key, val) {
            return $.assoc(acc, key, $.assoc(val, 'complete', true));
          },
          $.hash_map(),
          todoMap
        );
      });
    }],
    [TodoConstants.TODO_DESTROY, function (id) {
      this.set(['todos'], function (todoMap) {
        return $.reduce_kv(
          function (acc, key, val) {
              if ($.get(val, 'id') !== id) {
                return $.assoc(acc, key, val);
              }
              else {
                return acc;
              }
            },
            $.hash_map(),
            todoMap
          );
      });
    }],
    [TodoConstants.TODO_DESTROY_COMPLETED_TODOS, function () {
      this.set(['todos'], function (todoMap) {
        return $.reduce_kv(
          function (acc, key, val) {
            if ($.get(val, 'complete') !== true) {
              return $.assoc(acc, key, val);
            }
            else {
              return acc;
            }
          },
          $.hash_map(),
          todoMap
        );
      });
    }]
  ]
});

module.exports = TodoStore;
