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

/**
 * This component operates as a "Controller-View".  It listens for changes in
 * the TodoStore and passes the new data to its children.
 */

var Footer = require('./Footer.react');
var Header = require('./Header.react');
var MainSection = require('./MainSection.react');
var React = require('react');
var TodoStore = require('../stores/TodoStore');

/**
 * Retrieve the current TODO data from the TodoStore
 */
function getTodoState() {
  return {
    allTodos: TodoStore.get('todos'),
    areAllComplete: TodoStore.areAllComplete()
  };
}

var TodoApp = React.createClass({

  getInitialState: function() {
    return getTodoState();
  },

  componentDidMount: function() {
    TodoStore.addWatch(this._onChange);
  },

  componentWillUnmount: function() {
    TodoStore.removeWatch(this._onChange);
  },

  shouldComponentUpdate: function (nextProps, nextState) {
    return !TodoStore.$equals(this.state.allTodos, nextState.allTodos);
  },

  render: function() {
    var allTodos = TodoStore.toJS(this.state.allTodos);
    return (
      <div>
        <Header />
        <MainSection
          allTodos={allTodos}
          areAllComplete={this.state.areAllComplete}
        />
        <Footer allTodos={allTodos} />
      </div>
  	);
  },

  _onChange: function(keys, oldState, newState) {
    this.setState(getTodoState());
  }

});

module.exports = TodoApp;
