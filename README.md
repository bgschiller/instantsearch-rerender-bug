# instantsearch-rerender-bug

1. Set environment variables for `ALGOLIA_APP_ID` and `ALGOLIA_SEARCH_KEY`. I'm happy to provide mine if you need, as they're just for a demo environment for us.
2. `npm install` and `npm run dev`. Visit http://localhost:3000
3. In any order, click the "rerender" button and type something in the search box.

I expected this to work with no error. Instead I got the following error:

> Error: The `start` method needs to be called before `setUiState`.

## Investigation

We found that the `InstantSearchSSRProvider` component is causing unnecessary re-renders because of the way it accepts props to pass as a value into the underlying `InstantSearchSSRContext.Provider`.

It seems like this causes an InstantSearch instance to be disposed of (in useInstantSearch, because the `serverState` value appears to have changed), but then the replacement instance is not started.
