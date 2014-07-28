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
 * TodoConstants
 */

var Fluxy = require('fluxy');

var TodoConstants = Fluxy.createConstants({
  serviceMessages: [
    'TODO_CREATE',
    'TODO_UPDATE_TEXT',
    'TODO_TOGGLE_COMPLETION',
    'TODO_COMPLETE_ALL',
    'TODO_DESTROY',
    'TODO_DESTROY_COMPLETED_TODOS'
  ],
  messages: [
    'TODO_UNDO'
  ],
  values: {}
});

module.exports = TodoConstants;
