import { getSearchResultUrl } from "@shopify/hydrogen";
import {
  PredictiveSearchProvider,
  usePredictiveSearch,
  usePredictiveSearchActions,
  usePredictiveSearchForm,
} from "@shopify/hydrogen/react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";

import { Icon } from "~/components/ui/Icon";

import { PredictiveSuggestions, SEARCH_PAGE_PATH } from "./PredictiveSuggestions";

const INPUT_ID = "header-search-query";
const RESULTS_ID = "header-search-results";

/** Desktop header search: a real <form> (works without JS) with live suggestions. */
export function HeaderSearch({ className = "" }: { className?: string }) {
  return (
    <PredictiveSearchProvider searchAction={SEARCH_PAGE_PATH}>
      <HeaderSearchForm className={className} />
    </PredictiveSearchProvider>
  );
}

function HeaderSearchForm({ className }: { className: string }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { term } = usePredictiveSearch();
  const { clear } = usePredictiveSearchActions();
  const { formProps, register } = usePredictiveSearchForm();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  // Close the panel on navigation and on outside clicks.
  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const expanded = open && term.length > 0;

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <form
        {...formProps({
          className: "relative flex items-center",
          role: "search",
          "aria-label": "Search the store",
          onSubmit: (event, value) => {
            event.preventDefault();
            close();
            void navigate(getSearchResultUrl({ baseUrl: SEARCH_PAGE_PATH, term: value }));
          },
        })}
      >
        <label htmlFor={INPUT_ID} className="sr-only">
          Search for home essentials, décor, lighting and more
        </label>
        <span className="text-on-surface-secondary pointer-events-none absolute start-4 inline-flex">
          <Icon name="search" size={20} />
        </span>
        <input
          ref={inputRef}
          {...register("query", {
            id: INPUT_ID,
            placeholder: "Search for home essentials, décor, lighting…",
            role: "combobox",
            "aria-expanded": expanded,
            "aria-controls": RESULTS_ID,
            "aria-autocomplete": "list",
            className:
              "h-12 w-full !rounded-full border-border bg-white ps-12 pe-16 text-[0.95rem] shadow-sm",
            onFocus: () => setOpen(true),
            onKeyDown: (event) => {
              if (event.key === "Escape") {
                if (inputRef.current) inputRef.current.value = "";
                clear();
                close();
              } else {
                setOpen(true);
              }
            },
          })}
        />
        <button
          type="submit"
          className="bg-cta hover:bg-cta-hover text-cta-text absolute end-1 inline-flex h-10 w-12 items-center justify-center rounded-full motion-safe:transition-colors"
          aria-label="Search"
        >
          <Icon name="search" size={20} strokeWidth={2.25} />
        </button>
      </form>
      <div
        className={`surface-card absolute inset-x-0 top-full z-50 mt-2 max-h-[70vh] overflow-y-auto p-3 ${
          expanded ? "" : "hidden"
        }`}
      >
        <PredictiveSuggestions id={RESULTS_ID} onNavigate={close} />
      </div>
    </div>
  );
}
