import dayjs from "dayjs";

const fmt = (d) => dayjs(d).format("YYYY-MM-DDTHH:mm:ss");
export const getTodayRange = () => ({
  startDate: fmt(dayjs().startOf("day")),
  endDate: fmt(dayjs().endOf("day")),
});
export const getMonthRange = () => ({
  startDate: fmt(dayjs().startOf("month")),
  endDate: fmt(dayjs().endOf("day")),
});
export const getDateRange = (type) => {
  type = type === "date" ? "day" : type;
  return {
    startDate: fmt(dayjs().startOf(type)),
    endDate: fmt(dayjs().endOf(type)),
  };
};
