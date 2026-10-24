import { getSearchResultUrl } from "@shopify/hydrogen";
import {
  PredictiveSearchProvider,
  usePredictiveSearchActions,
  usePredictiveSearchForm,
} from "@shopify/hydrogen/react";
import { useRef } from "react";
import { useNavigate } from "react-router";

import { PredictiveSuggestions, SEARCH_PAGE_PATH } from "~/components/search/PredictiveSuggestions";
import { Icon } from "~/components/ui/Icon";
import { SEARCH_DRAWER_ID, closeSearchDrawer } from "~/lib/cart-drawer";

const TITLE_ID = "search-drawer-title";
const INPUT_ID = "search-drawer-query";
const RESULTS_ID = "search-drawer-results";

export function SearchDrawer() {
  return (
    <PredictiveSearchProvider searchAction={SEARCH_PAGE_PATH}>
      <SearchDialog />
    </PredictiveSearchProvider>
  );
}

function SearchDialog() {
  const navigate = useNavigate();
  const { clear } = usePredictiveSearchActions();
  const { formProps, register } = usePredictiveSearchForm();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <dialog
      id={SEARCH_DRAWER_ID}
      className="drawer-right bg-surface text-on-surface"
      aria-labelledby={TITLE_ID}
      data-testid="search-drawer"
      closedby="any"
      onClose={() => {
        // Assigning through the element keeps React's input value tracker in sync.
        if (inputRef.current) inputRef.current.value = "";
        clear();
      }}
    >
      <div className="flex h-full flex-col">
        <div className="border-border flex shrink-0 items-center gap-2 border-b py-3 ps-4 pe-2">
          <h2 id={TITLE_ID} className="sr-only">
            Search
          </h2>
          <form
            {...formProps({
              className: "relative flex-1",
              role: "search",
              "aria-labelledby": TITLE_ID,
              onSubmit: (event, term) => {
                event.preventDefault();
                closeSearchDrawer();
                void navigate(getSearchResultUrl({ baseUrl: SEARCH_PAGE_PATH, term }));
              },
            })}
          >
            <label htmlFor={INPUT_ID} className="sr-only">
              Search products
            </label>
            <span className="text-on-surface-secondary pointer-events-none absolute start-4 top-1/2 inline-flex -translate-y-1/2">
              <Icon name="search" size={20} />
            </span>
            <input
              ref={inputRef}
              {...register("query", {
                id: INPUT_ID,
                placeholder: "Search décor, lighting, kitchen…",
                "aria-controls": RESULTS_ID,
                className: "h-12 w-full bg-white ps-12 text-base",
                onKeyDown: (event) => {
                  // Chromium spends the first Escape on clearing a type=search input.
                  if (event.key !== "Escape") return;
                  event.preventDefault();
                  closeSearchDrawer();
                },
              })}
            />
          </form>
          <button
            type="button"
            commandfor={SEARCH_DRAWER_ID}
            command="close"
            className="hover:bg-peach-soft inline-flex size-11 shrink-0 items-center justify-center rounded-full"
            aria-label="Close search"
            onClick={() => closeSearchDrawer()}
          >
            <Icon name="close" size={22} />
          </button>
        </div>
        <PredictiveSuggestions
          id={RESULTS_ID}
          className="flex-1 overflow-y-auto p-3"
          onNavigate={() => closeSearchDrawer()}
        />
      </div>
    </dialog>
  );
}
