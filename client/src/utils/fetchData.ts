import { httpClient } from "@/api/httpClient";
import { ApiResponse, TableResponse } from "@/types/api";
import { BusinessModel } from "@/types/business";
import { AreaModel } from "@/types/area";

// ========================== BUSINESS ==========================
export const fetchBusinesses = async (params: {
  page: number;
  pageSize: number;
  filters: Record<string, any>;
}): Promise<ApiResponse<TableResponse<BusinessModel>>> => {
  const { page, pageSize, filters } = params;
  const searchParams = new URLSearchParams();

  searchParams.append("pageIndex", page.toString());
  searchParams.append("pageSize", pageSize.toString());

  Object.entries(filters).forEach(([key, value]) => {
    if (!value) return;
    if (Array.isArray(value)) {
      value.forEach((v) => searchParams.append(key, v));
    } else {
      searchParams.append(key, value);
    }
  });

  const res = await httpClient.get<ApiResponse<TableResponse<BusinessModel>>>(
    `/Business?${searchParams.toString()}`
  );

  return res.data;
};

// ========================== AREA ==========================
export const fetchBuildings = async (params: {
  page: number;
  pageSize: number;
  filters: Record<string, any>;
}) => {
  const { page, pageSize, filters } = params;
  const searchParams = new URLSearchParams();
  searchParams.append("pageIndex", page.toString());
  searchParams.append("pageSize", pageSize.toString());
  Object.entries(filters).forEach(([key, value]) => {
    if (!value) return;
    if (Array.isArray(value)) {
      value.forEach((v) => searchParams.append(key, v));
    } else {
      searchParams.append(key, value);
    }
  });
  const response = await httpClient.get<ApiResponse<TableResponse<AreaModel>>>(
    `/Building?${searchParams.toString()}`
  );
  return response.data;
};

export const FILTER_KEYS = ["name", "taxNumber", "status"];

export const getInitialStateFromURL = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const pageParam = searchParams.get("page");
  const pageSizeParam = searchParams.get("pageSize");
  const filters: Record<string, any> = {};

  FILTER_KEYS.forEach((key) => {
    const values = searchParams.getAll(key);
    if (values.length > 1) {
      filters[key] = values;
    } else if (values.length === 1) {
      filters[key] = values[0];
    }
  });

  return {
    page: pageParam ? parseInt(pageParam, 10) : 1,
    pageSize: pageSizeParam ? parseInt(pageSizeParam, 10) : 15,
    filters,
  };
};
