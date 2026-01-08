import { httpClient } from "@/api/httpClient";
import { ApiResponse } from "@/types/api";
import { Button, Card, Chip, Divider, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { Box, Grid } from "@mui/system";
import React, { Fragment } from "react";
import { Business } from "@/types/business";
import { EditOutlined } from "@mui/icons-material";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { AreaModel } from "@/types/area";
import { BusinessModel } from "@/types/business";
import formatPhoneNum from "@/utils/formatPhoneNum";
import dayjs from "dayjs";
import { formatTimeHHMM } from "@/utils/datetime";
const ViewAreaForm = ({ id }: { id: string }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: userData } = useQuery({
    queryKey: ["building", id],
    enabled: !!id,
    queryFn: async () => {
      const res = await httpClient.get<ApiResponse<AreaModel>>(`/Building/${id}`);
      return res.data.metadata;
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const { data: businessData } = useQuery({
    queryKey: ["business", userData?.businessId],
    enabled: !!userData?.businessId,
    queryFn: async () => {
      const res = await httpClient.get<ApiResponse<BusinessModel>>(
        `/Business/${userData?.businessId}`
      );
      return res.data.metadata;
    },
  });

  const areaInfoListFields = [
    {
      label: t("page:area:name"),
      value: userData?.name,
    },
    {
      label: t("page:area:city"),
      value: userData?.city,
    },

    {
      label: t("page:area:buildingType"),
      value: userData?.buildingType,
    },
    {
      label: t("page:area:operationalHours"),
      value:
        typeof userData?.operationalHours === "object" && userData?.operationalHours
          ? `${formatTimeHHMM(userData.operationalHours.startTime)} - ${formatTimeHHMM(
              userData.operationalHours.endTime
            )}`
          : "-",
    },
    {
      label: t("page:area:businessId"),
      value: businessData?.name,
    },

    {
      label: t("page:area:location"),
      value: userData?.location,
    },
  ];

  const contactInfoFields = [
    {
      label: t("page:manager:name"),
      value: userData?.manager.name,
    },
    {
      label: t("page:manager:position"),
      value: userData?.manager.position,
    },

    {
      label: t("page:manager:phoneNumber"),
      value: formatPhoneNum(userData?.manager.phoneNumber),
    },

    {
      label: t("page:manager:email"),
      value: userData?.manager.email,
    },
  ];

  for (const field of areaInfoListFields) {
    if (field.label === t("page:area:buildingType")) {
      field.value = t(`page:area:buildingTypeOptions.${field.value}`);
    }
  }

  return (
    <Card sx={{ p: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h3" fontWeight="bold">
            {t("page:area:name")}: {userData?.name}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Chip
            label={
              userData?.status
                ? t(`page:area:statusOptions.${userData.status}`, {
                    defaultValue: userData.status,
                  })
                : t("page:area:status")
            }
            color={userData?.status === "active" ? "success" : "default"}
          />
        </Box>
      </Box>
      <Box sx={{ my: 2 }}>
        <Typography variant="h4">{t("page:area:robotList:title")}</Typography>
        <Grid container spacing={2} sx={{ mt: 2, width: "100%" }}>
          <Fragment key="robot-list">
            {areaInfoListFields.map((field) => (
              <Fragment key={field.label}>
                <Grid size={{ xs: 8, sm: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {field.label}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 16, sm: 4 }}>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {field.value}
                  </Typography>
                </Grid>
              </Fragment>
            ))}
          </Fragment>
        </Grid>
      </Box>
      <Divider sx={{ my: 4, borderColor: "divider" }} />

      <Box sx={{ my: 2 }}>
        <Typography variant="h4">{t("page:area:contactInfo:title")}</Typography>
        <Grid container spacing={2} sx={{ mt: 2, width: "100%" }}>
          <Fragment key="contact-info">
            {contactInfoFields.map((field) => (
              <Fragment key={field.label}>
                <Grid size={{ xs: 8, sm: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {field.label}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 16, sm: 4 }}>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {field.value}
                  </Typography>
                </Grid>
              </Fragment>
            ))}
          </Fragment>
        </Grid>
      </Box>
    </Card>
  );
};

export default ViewAreaForm;
