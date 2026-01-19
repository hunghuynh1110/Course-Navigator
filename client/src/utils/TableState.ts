import { useCallback } from "react";

export const FILTER_KEYS = ["name", "taxNumber", "status"];

export const getInitialStateFromURL = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const pageParam = searchParams.get("page");
  const pageSizeParam = searchParams.get("pageSize");

  return {
    page: pageParam ? parseInt(pageParam, 10) : 1,
    pageSize: pageSizeParam ? parseInt(pageSizeParam, 10) : 15,
  };
};

export const syncStateFromURL = (setTableState: (state: any) => void, tableState: any) =>
  useCallback(() => {
    setTableState((prev: any) => {
      const isDiff =
        prev.page !== tableState.page ||
        prev.pageSize !== tableState.pageSize ||
        JSON.stringify(prev.filters) !== JSON.stringify(tableState.filters);
      return isDiff ? tableState : prev;
    });
  }, []);
