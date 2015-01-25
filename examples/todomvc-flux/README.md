# Fluxy TodoMVC Example
A sample implementation of Fluxy, based on Facebook's [example Flux
project](https://github.com/facebook/react/tree/master/examples/todomvc-flux).

In addition to the usual TodoMVC functionality, this example shows some nice Fluxy benefits:

* easy undo of last action
* saving client app state to the server
* server-side rendering with React and Fluxy

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

## Building

You must have [npm](https://www.npmjs.org/) installed on your computer.
Also [browserify](http://browserify.org/) must be installed globally in order to build the app.

From the example's root directory run these commands from the command line:

    npm install

This will install all dependencies.

    npm install -g browserify@~2.36.0

This installs browserify globally. A symlink, typically under `/usr/local/bin/browserify`, will be created and you (as well as the build script) can run the `browserify` command from now on.

## Running

There are two ways of running the example.

First, as a client side only app (via static HTML), just run `npm run-script build` and
then start a http server that makes the index.html file accessible (via, say, [`httpster`](https://github.com/SimbCo/httpster)).

Alternatively, you can run an express server that will enable server side rendering. To do so,
just run `npm run-script server`, and then hit localhost:3333/todo.

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
