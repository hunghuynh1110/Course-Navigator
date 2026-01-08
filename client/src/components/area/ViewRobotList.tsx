import React, { useCallback, useState } from "react";
import { DataTable, DataTableColumn } from "../table";
import { Chip, Button } from "@mui/material";
import { Robot } from "@/types/robot";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";
import { AddOutlined } from "@mui/icons-material";
import { httpClient } from "@/api/httpClient";
import { ApiResponse, TableResponse, TableResponseBase } from "@/types/api";
import { AreaModel } from "@/types/area";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchBuildings } from "@/utils/fetchData";
import { Card } from "@mui/material";

export const renderBuildingType = (v: string) => {
  const { t } = useTranslation();
  switch (v) {
    case "comercial":
      return t("page:area:buildingTypeOptions:comercial");
    case "service":
      return t("page:area:buildingTypeOptions:service");
    case "industrial":
      return t("page:area:buildingTypeOptions:industrial");
    default:
      return v;
  }
};

export const renderStatusChip = (v: any): React.ReactNode => {
  const { t } = useTranslation();

  const map: Record<string, { color?: "success" | "warning" | "primary" | "default" }> = {
    running: { color: "success" },
    charging: { color: "warning" },
    active: { color: "success" },
    inactive: { color: "default" },
    monitoring: { color: "primary" },
    idle: { color: "default" },
  };
  return (
    <Chip label={t(`page:area:robotList.statusOptions.${v}`)} color={map[v]?.color} size="small" />
  );
};

export const renderRobotType = (v: string) => {
  const { t } = useTranslation();
  switch (v) {
    case "lift":
      return t("page:area:robotList:robotTypeOptions:lift");
    case "humanoid":
      return t("page:area:robotList:robotTypeOptions:humanoid");
    case "delivery":
      return t("page:area:robotList:robotTypeOptions:delivery");
    default:
      return "-";
  }
};
const ViewRobotList = ({ id }: { id: string }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tableState, setTableState] = useState({ pageIndex: 0, pageSize: 15, filterValues: {} });

  const { data: areaData } = useQuery({
    queryKey: ["building", id],
    queryFn: async () => {
      const res = await httpClient.get<ApiResponse<AreaModel>>(`/Building/${id}`);
      return res.data.metadata;
    },
    enabled: !!id,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const robotList = areaData?.robots || [];

  const columns: DataTableColumn<Robot>[] = [
    {
      key: "index",
      title: "#",
      dataIndex: "id",
      width: 20,
      render: (_, __, index: number) => index + 1,
    },
    {
      key: "robotCode",
      title: t("page:area:robotList:robotCode"),
      dataIndex: "robotCode",
      render: (v: string) => v || "-",
    },

    {
      key: "firmwareVersion",
      title: t("page:area:robotList:robotType"),
      dataIndex: "robotType",
      render: (v: string) => renderRobotType(v),
    },
    {
      key: "currentBuildingId",
      title: t("page:area:robotList:currentBuilding"),
      dataIndex: "currentBuildingId",
      render: (v: string) => areaData?.name || "-",
    },
    {
      key: "status",
      title: t("page:area:robotList:status"),
      dataIndex: "status",
      render: (v: string) => renderStatusChip(v),
    },
  ];
  const handlePageChange = (newPage: number) => {
    setTableState((prev) => ({ ...prev, pageIndex: newPage }));
  };
  const handlePageSizeChange = (newSize: number) => {
    setTableState((prev) => ({ ...prev, pageSize: newSize }));
  };

  const startIndex = tableState.pageIndex * tableState.pageSize;
  const endIndex = startIndex + tableState.pageSize;
  const currentRobots = robotList.slice(startIndex, endIndex);

  return (
    <Card>
      <DataTable
        data={currentRobots}
        columns={columns}
        pagination={{
          pageIndex: tableState.pageIndex,
          pageSize: tableState.pageSize,
          totalCount: robotList.length,
          totalPage: Math.ceil(robotList.length / tableState.pageSize),
        }}
        hideHeader={true}
        height="100%"
        onChangePage={handlePageChange}
        onChangePageSize={handlePageSizeChange}
      />
    </Card>
  );
};
export default ViewRobotList;
