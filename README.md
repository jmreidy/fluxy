#Fluxy

An implementation of Facebook's Flux architecture.

##Introduction

The Facebook / React team has an [introduction to
Flux](http://facebook.github.io/react/docs/flux-overview.html) included with
the React documentation. Distilled to its core, Flux reimagines the
tradtional MVC approach to client-side webapps, replacing it with the
same concept of "one-way data flow" that powers React.

While the Facebook documentation (and accompanying video) do an excellent job of
introducing the core concepts behind Flux, there's a few key details that are important
to emphasize:

###Stores
All application data is managed in Stores, which a Singleton objects focused on a specific
set of business logic (e.g ArticleStore, UserStore). Views should intereact with Stores
as the single source of data truth. Store *do not replace* the React state system; rather,
React components should use state to handle view-specific data state, and stores to handle applicaiton
data state. Stores are event emitters that emit change events for underlying state changes.

###Actions
While Views access data directly from Stores, they never mutate data directly. Rather,
Views should trigger Actions, which in turn trigger broadcast notifications throughout the system.
Broadcast notifications are identified via lookups in enum Constants, and include a payload object.

For example, clicking a button in a view to favorite an article would make a call to an ArticleFavorite action,
which would then broadcast a FAVORITE_ARTICLE notification with an appropriate payload
for any Stores that want to perform an optimistic update. The Action would then interact with a DAO
or Service to perform the actual server-side favorite; depending on the result of this interaction,
the Action would then broadcast a FAVORITE_ARTICLE_COMPLETED or FAVORITE_ARTICLE_FAILED notification.

###Dispatcher
Each of the notifications broadcast via the Actions described above are marshalled through a central bus,
the Dispatcher. The Dispatcher ensures that only one notification can be handled at a time; new notifications
are queued until all action handlers have finished operating for the previous notification. Stores register
their action handlers for specific notifications directly with the Dispatcher, and can specify action handler
dependencies - that is, an action handler can have its invocation delayed until the completion of other
action handlers.

###This Implementation
Facebook has not yet released their own implementation of Flux, but the JS community
has started the ideas behind the Flux architecture, most notably in @BinaryMuse's
[fluxxor](https://github.com/BinaryMuse/fluxxor). Fluxy is an implementation that
includes some differentiating features:

  * View components should be completely separated from Flux. They can intereact with Flux Stores
  and Actions via direct API calls, without coupling them to the Flux implementation.

  * Promises (via [Bluebird](https://github.com/petkaantonov/bluebird/)) drive the Dispatcher/Action system, along for the easy registration of async action handlers

  * Stores embrace immutable data, going so far as to be powered by [Mori](https://github.com/swannodette/mori), which
  provides a light convenience API around ClojureScript's data structures.


##How to Use
To be written

##Roadmap to 1.0
- [ ] Update generators to work with new API
- [ ] Update example app to work with new API
- [ ] Provide basic implementation steps in the README
- [ ] Add code documentation
- [ ] Cleanup internal implementation

