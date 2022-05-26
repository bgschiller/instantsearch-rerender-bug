import { useState } from "react";
import algoliasearch from "algoliasearch/lite";
import type { InstantSearchServerState } from "react-instantsearch-hooks-web";
import { InstantSearchSSRProvider } from "react-instantsearch-hooks-web";
import { Hits, InstantSearch, SearchBox } from "react-instantsearch-hooks-web";
import { getServerState } from "react-instantsearch-hooks-server";
import { useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";

type SearchEntry = {
  fields: {
    title: string;
    slug: {
      "en-US": string;
    };
  };
  sys: {
    contentType: {
      sys: {
        id: string;
      };
    };
  };
};

function Hit({ hit }: { hit: SearchEntry }) {
  // Replace this with whatever you want, it's not important for reproducing the error
  // I tried to pick something that works with my data, but should fail gracefully on yours
  return <div>{hit?.fields?.slug?.["en-US"] || JSON.stringify(hit)}</div>;
}

interface AlgoliaWrapperProps {
  apiKey: string;
  appId: string;
  serverState?: InstantSearchServerState;
}

function AlgoliaWrapper({ apiKey, appId, serverState }: AlgoliaWrapperProps) {
  const [searchClient] = useState(algoliasearch(appId, apiKey));

  return (
    <InstantSearchSSRProvider {...serverState}>
      <InstantSearch
        indexName="prod_site_search"
        searchClient={searchClient}
        // if we remove onStateChange, everything is fine.
        // That works for this minimal repro, but I need to use it in the real project.
        onStateChange={({ uiState, setUiState }) => {
          console.log("onStateChange", uiState);
          setUiState(uiState);
        }}
      >
        <div className="flex flex-wrap gap-4">
          <div className="w-full sm:w-52">
            <SearchBox />
          </div>
          <div className="grow">
            <Hits hitComponent={Hit} />
          </div>
        </div>
      </InstantSearch>
    </InstantSearchSSRProvider>
  );
}

interface LoaderData {
  apiKey: string;
  appId: string;
  serverState: InstantSearchServerState;
}

export const loader: LoaderFunction = async (): Promise<LoaderData> => {
  const appId = process.env.ALGOLIA_APP_ID!;
  const apiKey = process.env.ALGOLIA_SEARCH_KEY!;

  const serverState = await getServerState(
    <AlgoliaWrapper apiKey={apiKey} appId={appId} />
  );
  return {
    appId,
    apiKey,
    serverState,
  };
};

export default function Index() {
  const { appId, apiKey, serverState } = useLoaderData<LoaderData>();
  const [count, setCount] = useState(1);

  return (
    <main>
      <AlgoliaWrapper apiKey={apiKey} appId={appId} serverState={serverState} />
      <button onClick={() => setCount(count + 1)}>rerender</button>
    </main>
  );
}
