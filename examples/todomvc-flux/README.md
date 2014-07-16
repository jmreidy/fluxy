# Fluxy TodoMVC Example
A sample implementation of Fluxy, based on Facebook's [example Flux project](https://github.com/facebook/react/tree/master/examples/todomvc-flux).

## TodoMVC Example Implementation

In this TodoMVC example application, we can see the elements of Flux in our directory structure.  Views here are referred to as "components" as they are React components.

<pre>
./
  index.html
  js/
    actions/
      TodoActions.js
    app.js
    bundle.js
    components/
      Footer.react.js
      Header.react.js
      MainSection.react.js
      TodoApp.react.js
      TodoItem.react.js
      TodoTextInput.react.js
    stores/
      TodoStore.js
</pre>

The primary entry point into the application is app.js.  This file bootstraps
the React rendering inside of index.html.  TodoApp.js is our controller-view
and it passes all data down into its child React components.

TodoActions.js is a collection of actions that views may call from within their
event handlers, in response to user interactions.

TodoStore.js is our only store.  It provides all of the application logic and
in-memory storage.

The bundle.js file is automatically genenerated by the build process, explained
below.

## Running

You must have [npm](https://www.npmjs.org/) installed on your computer.
From the root project directory run these commands from the command line:

    npm install

This will install all dependencies.

To build the project, first run this command:

    npm start

This will perform an initial build and start a watcher process that will update
build.js with any changes you wish to make.  This watcher is based on
[Browserify](http://browserify.org/) and
[Watchify](https://github.com/substack/watchify), and it transforms React's JSX
syntax into standard JavaScript with
[Reactify](https://github.com/andreypopp/reactify).

To run the app, spin up an HTTP server and visit
http://localhost/.../todomvc-flux/.


## Credit

The original TodoMVC application was created by [Bill
Fisher](https://www.facebook.com/bill.fisher.771), and its README document was
written by Bill Fisher and the principal creator of Flux, [Jing
Chen](https://www.facebook.com/jing).


## License

> Copyright 2013-2014 Justin Reidy
>
> Licensed under the Apache License, Version 2.0 (the "License");
> you may not use this file except in compliance with the License.
> You may obtain a copy of the License at
>
> http://www.apache.org/licenses/LICENSE-2.0
>
> Unless required by applicable law or agreed to in writing, software
> distributed under the License is distributed on an "AS IS" BASIS,
> WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
> See the License for the specific language governing permissions and
> limitations under the License.
