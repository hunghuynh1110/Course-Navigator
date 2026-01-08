import React, { useCallback, useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, Link, useLocation } from "@tanstack/react-router";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@mui/material";
import { PageWrapper, PageHeader, PageContent } from "@/layouts/Page";
import { DataTable, DataTableColumn } from "../table";
import { FilterFieldItem, FilterForm } from "../filter-form";

import {
  Box,
  Button,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { AddOutlined, CheckCircleOutlined } from "@mui/icons-material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";

import { AreaModel } from "@/types/area";
import { TableResponseBase } from "@/types/api";
import { httpClient } from "@/api/httpClient";
import { renderStatusChip, renderBuildingType } from "./ViewRobotList";
import { fetchBuildings, getInitialStateFromURL } from "@/utils/fetchData";

const MainAreaTable = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  // ===== STATE =====
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedArea, setSelectedArea] = useState<AreaModel | null>(null);
  const [tableState, setTableState] = useState(getInitialStateFromURL);

  const [isInitialized, setIsInitialized] = useState(false);
  /* ===== URL SYNC LOGIC ===== */
  const syncStateFromURL = useCallback(() => {
    const newState = getInitialStateFromURL();
    setTableState((prev) => {
      const isDiff =
        prev.page !== newState.page ||
        prev.pageSize !== newState.pageSize ||
        JSON.stringify(prev.filters) !== JSON.stringify(newState.filters);
      return isDiff ? newState : prev;
    });
  }, []);
  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true);
      return;
    }
    window.addEventListener("popstate", syncStateFromURL);
    return () => window.removeEventListener("popstate", syncStateFromURL);
  }, [isInitialized, syncStateFromURL]);

  useEffect(() => {
    if (!isInitialized) return;
    const searchParams = new URLSearchParams();
    const { page, pageSize, filters } = tableState;

    if (page > 1) searchParams.set("page", page.toString());
    if (pageSize !== 15) searchParams.set("pageSize", pageSize.toString());

    Object.entries(filters).forEach(([key, value]) => {
      if (value) searchParams.set(key, value as string);
    });

    const newSearch = searchParams.toString();
    const currentSearch = window.location.search.slice(1);

    if (newSearch !== currentSearch) {
      const newUrl = newSearch ? `${location.pathname}?${newSearch}` : location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, [tableState, location.pathname, isInitialized]);

  // ===== QUERIES =====

  const { data: areaDatas, isLoading } = useQuery({
    queryKey: ["buildings", tableState.page, tableState.pageSize, tableState.filters],
    queryFn: () =>
      fetchBuildings({
        page: tableState.page,
        pageSize: tableState.pageSize,
        filters: tableState.filters,
      }),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // ===== DATA PROCESSING =====
  const areaDataList: AreaModel[] = areaDatas?.metadata?.data || [];

  const responseMetadata = areaDatas?.metadata || TableResponseBase;
  const buildingList = responseMetadata.data || [];

  // ===== EVENT HANDLERS =====
  const handleFilterChange = (newFilters: Record<string, any>) => {
    setTableState((prev) => ({ ...prev, filters: newFilters, page: 1 }));
  };

  const handleClearFilter = () => {
    setTableState((prev) => ({ ...prev, filters: {}, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setTableState((prev) => ({ ...prev, page: newPage + 1 }));
  };

  const handlePageSizeChange = (newSize: number) => {
    setTableState((prev) => ({ ...prev, pageSize: newSize, page: 1 }));
  };

  const handleMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>, item: AreaModel) => {
    setMenuAnchor(event.currentTarget);
    setSelectedArea(item);
  }, []);

  const handleMenuClose = useCallback(() => {
    setMenuAnchor(null);
    setSelectedArea(null);
  }, []);

  const handleViewDetails = useCallback(() => {
    if (selectedArea) {
      navigate({ to: "/area/$id", params: { id: selectedArea.id } });
    }
    handleMenuClose();
  }, [selectedArea, navigate, handleMenuClose]);

  const handleEdit = useCallback(() => {
    if (selectedArea) {
      navigate({ to: "/area/edit/$id", params: { id: selectedArea.id } });
    }
    handleMenuClose();
  }, [selectedArea, navigate, handleMenuClose]);

  const handleDeactivate = useCallback(async () => {
    if (!selectedArea) return;
    await httpClient.patch(`/Building/Deactivate/${selectedArea.id}`, {
      status: "inactive",
    });
    await queryClient.refetchQueries({
      queryKey: ["buildings", tableState.page, tableState.pageSize, tableState.filters],
    });
    handleMenuClose();
  }, [selectedArea, handleMenuClose, tableState.page, tableState.pageSize, tableState.filters]);

  const handleActivate = useCallback(async () => {
    if (!selectedArea) return;
    await httpClient.patch(`/Building/Activate/${selectedArea.id}`, {
      status: "active",
    });
    await queryClient.refetchQueries({
      queryKey: ["buildings", tableState.page, tableState.pageSize, tableState.filters],
    });
    handleMenuClose();
  }, [
    selectedArea,
    handleMenuClose,
    queryClient,
    tableState.page,
    tableState.pageSize,
    tableState.filters,
  ]);

  const filterItems: FilterFieldItem[] = useMemo(
    () => [
      {
        name: "status",
        label: t("page:area:filter:status"),
        type: "select",
        options: [
          { value: "active", label: t("page:area:statusOptions:active") },
          { value: "inactive", label: t("page:area:statusOptions:inactive") },
        ],
      },
      {
        name: "name",
        label: t("page:area:filter:name"),
        type: "text",
        placeholder: t("page:area:filter:name"),
      },
    ],
    [t]
  );

  const columns: DataTableColumn<AreaModel>[] = useMemo(
    () => [
      {
        key: "index",
        title: t("page:area:stt"),
        dataIndex: "id",
        width: 10,
        render: (_, __, index: number) => (tableState.page - 1) * tableState.pageSize + index + 1,
      },
      {
        key: "name",
        title: t("page:area:name"),
        dataIndex: "name",
        width: 120,
        render: (v: string, row: AreaModel) => (
          <Typography
            component={Link}
            to={`/area/${row.id}`}
            sx={{
              textDecoration: "none",
              color: "primary.main",
            }}
          >
            {v || "-"}
          </Typography>
        ),
      },
      {
        key: "buildingType",
        title: t("page:area:buildingType"),
        dataIndex: "buildingType",
        width: 80,
        render: (v) => renderBuildingType(v),
      },
      {
        key: "businessName",
        title: t("page:area:businessName"),
        dataIndex: "businessName",
        width: 120,
        render: (v) => v || "-",
      },
      {
        key: "city",
        title: t("page:area:city"),
        dataIndex: "city",
        width: 100,
        render: (v) => v || "-",
      },
      {
        key: "totalRobots",
        title: t("page:area:totalRobots"),
        dataIndex: "totalRobots",
        width: 50,
      },
      {
        key: "status",
        title: t("page:area:status"),
        dataIndex: "status",
        width: 60,
        render: (v) => renderStatusChip(v),
      },
      {
        key: "actions",
        title: "",
        dataIndex: "id",
        width: 20,
        render: (_, row: AreaModel) => (
          <>
            <Tooltip title={t("page:area:action")}>
              <IconButton
                size="small"
                onClick={(e) => handleMenuOpen(e, row)}
                sx={{ color: "text.secondary", "&:hover": { color: "primary.main" } }}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor) && selectedArea?.id === row.id}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
            >
              <MenuItem onClick={handleViewDetails}>
                <ListItemIcon>
                  <VisibilityOutlinedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>{t("page:area:actions:viewDetails")}</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleEdit}>
                <ListItemIcon>
                  <EditOutlinedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>{t("page:area:actions:edit")}</ListItemText>
              </MenuItem>
              {row.status === "active" ? (
                <MenuItem onClick={handleDeactivate}>
                  <ListItemIcon>
                    <BlockOutlinedIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>{t("page:area:actions:deactivate")}</ListItemText>
                </MenuItem>
              ) : (
                <MenuItem onClick={handleActivate}>
                  <ListItemIcon>
                    <CheckCircleOutlined fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>{t("page:area:actions:activate")}</ListItemText>
                </MenuItem>
              )}
            </Menu>
          </>
        ),
      },
    ],
    [
      t,
      tableState.page,
      tableState.pageSize,
      menuAnchor,
      selectedArea,
      handleMenuOpen,
      handleMenuClose,
      handleViewDetails,
      handleEdit,
      handleDeactivate,
    ]
  );

  return (
    <PageWrapper>
      <PageHeader pageName={t("page:area:title")} />

      <PageContent>
        <Card>
          <DataTable
            data={buildingList}
            columns={columns}
            loading={isLoading}
            pagination={{
              pageIndex: tableState.page - 1,
              pageSize: tableState.pageSize,
              totalCount: responseMetadata.totalCount,
              totalPage: responseMetadata.totalPage,
            }}
            onChangePage={handlePageChange}
            onChangePageSize={handlePageSizeChange}
            filters={
              <FilterForm
                items={filterItems}
                values={tableState.filters}
                onValuesChange={handleFilterChange}
                onClearFilter={handleClearFilter}
                size="small"
              />
            }
            actions={
              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<AddOutlined />}
                onClick={() => {
                  navigate({ to: "/area/add" });
                }}
              >
                {t("page:area:createNew")}
              </Button>
            }
            onReload={() =>
              queryClient.refetchQueries({
                queryKey: ["buildings", tableState.page, tableState.pageSize, tableState.filters],
              })
            }
          />
        </Card>
      </PageContent>
    </PageWrapper>
  );
};

export default MainAreaTable;
