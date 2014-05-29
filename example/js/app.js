/** @jsx React.DOM */
var React = require('react');
var Main = require('./components/Main');

var Flux = require('../../index');
Flux.start();

window.React = React; //for the react inspector

React.renderComponent(
  <Main />,
  document.getElementById('content')
);

