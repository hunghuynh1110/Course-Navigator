import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";

import type { FilterFieldItem, FilterValues } from "./types";
import { generateFormFields } from "../form/utils";

interface FilterFormContextValue extends FilterFormProviderProps {
  values: FilterValues;
  form: UseFormReturn<FilterValues>;
  lag: (key: string) => string;
  activeKeys: string[];
  openKey: string | null;
  setOpenKey: (v: string | null) => void;
  addFilter: (key: string) => void;
  onDeleteItem: (key: string) => void;
  onChangeValue: (key: string, value: any) => void;
  handleClearFilter: () => void;
}

const FilterFormContext = createContext<FilterFormContextValue | null>(null);

export interface FilterFormProviderProps {
  defaultValues?: FilterValues;
  values?: FilterValues;
  items: FilterFieldItem[];
  size: "small" | "medium" | "large";
  onValueChange?: (key: string, value: any) => void;
  onValuesChange?: (values: FilterValues) => void;
  onClearFilter?: () => void;
}

export const FilterFormProvider = (props: FilterFormProviderProps & { children: ReactNode }) => {
  const {
    children,
    items,
    defaultValues = {},
    values = {},
    onValueChange,
    onValuesChange,
    onClearFilter,
  } = props;
  const { t: lag } = useTranslation();

  const schemas = useMemo(() => generateFormFields(items), [JSON.stringify(items)]);

  const [internalValues, setInternalValues] = useState<FilterValues>(defaultValues);
  const [activeKeys, setActiveKeys] = useState<string[]>([]);
  const [openKey, setOpenKey] = useState<string | null>(null);

  const form = useForm({
    defaultValues,
    resolver: zodResolver(schemas),
  });

  useEffect(() => {
    setInternalValues(values);
    setActiveKeys(Object.keys(values));
  }, [JSON.stringify(values)]);

  const addFilter = (key: string) => {
    setActiveKeys((prev) => [...prev, key]);
    setOpenKey(key);
  };

  const onDeleteItem = (key: string) => {
    setActiveKeys((prev) => prev.filter((k) => k !== key));
    onValueChange?.(key, "");
    const { [key]: _, ...rest } = internalValues;
    onValuesChange?.(rest);
  };

  const onChangeValue = (key: string, value: any) => {
    const next = { ...internalValues, [key]: value };
    setInternalValues(next);
    onValuesChange?.(next);
    onValueChange?.(key, value);
    setOpenKey(null);
  };

  const handleClearFilter = () => {
    setActiveKeys([]);
    onClearFilter?.();
  };

  return (
    <FilterFormContext.Provider
      value={{
        ...props,
        items,
        values: internalValues,
        form,
        lag,
        activeKeys,
        openKey,
        setOpenKey,
        addFilter,
        onDeleteItem,
        onChangeValue,
        handleClearFilter,
      }}
    >
      {children}
    </FilterFormContext.Provider>
  );
};

export const useFilterForm = () => {
  const ctx = useContext(FilterFormContext);
  if (!ctx) throw new Error("useFilterForm must be used within provider");
  return ctx;
};
