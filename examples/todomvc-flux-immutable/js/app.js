/**
 * Copyright 2013-2014 Facebook, Inc.
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
 * @jsx React.DOM
 */

var React = require('react');
var Fluxy = require('fluxy');

var ImmutableProxy = require('fluxy/lib/collections/ImmutableProxy');

Fluxy.setCollectionProxyType(ImmutableProxy);

var TodoApp = require('./components/TodoApp.react');

// TODO this fails to create proper data for immutable-js because
// JS objects are always converted with string keys, and the
// todo items have numeric keys.
// Maybe the fromJS converter can be used to convert the keys
Fluxy.bootstrap('__fluxy__');

React.render(
  <TodoApp />,
  document.getElementById('todoapp')
);
