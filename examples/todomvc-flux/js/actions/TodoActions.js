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
 * TodoActions
 */

var Fluxy = require('fluxy');

var TodoConstants = require('../constants/TodoConstants');
var TodoService = require('../services/TodoService');

var TodoActions = Fluxy.createActions({
  serviceActions: {
    create: [TodoConstants.TODO_CREATE, function (text) {
      return TodoService.create(text);
    }],
    updateText: [TodoConstants.TODO_UPDATE_TEXT, function (id, text) {
      return TodoService.update(id, {text: text});
    }],
    toggleComplete: [TodoConstants.TODO_TOGGLE_COMPLETION, function (id, completed) {
      return TodoService.update(id, {completed: completed});
    }],
    completeAll: [TodoConstants.TODO_COMPLETE_ALL, function () {
      return TodoService.completeAll();
    }],
    destroy: [TodoConstants.TODO_DESTROY, function (id) {
      return TodoService.destroy(id);
    }],
    destroyCompletedTodos: [TodoConstants.TODO_DESTROY_COMPLETED_TODOS, function () {
      return TodoService.destroyCompleted();
    }]
  }
});

module.exports = TodoActions;
