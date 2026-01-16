import dayjs from "dayjs";

export const formatNumber = (
  num,
  {
    locale = "en-US",
    decimals,
    eps = 1e-9,
    isPositive,
    isString,
    isChange,
    mode = "table",
    max4ForLarge = true,
  } = {}
) => {
  if (isString) return num;
  if (num === null || num === undefined || Number.isNaN(Number(num))) return "--";

  let n = Number(num);
  if (isPositive && n < 0) return "0";
  if (isChange && n < 0) n = n * -1;

  if (Math.abs(n) >= 1e12) {
    if (max4ForLarge) {
      const exp = Math.floor(Math.log10(Math.abs(n)));
      const base = Math.round(n / Math.pow(10, exp));
      return `${base}e${exp}`;
    } else {
      return n.toExponential();
    }
  }

  if (Math.abs(n) < 1e-3 && n !== 0) {
    return n.toExponential(2);
  }

  const units = [
    { value: 1e12, symbol: "T" },
    { value: 1e9, symbol: "B" },
    { value: 1e6, symbol: "M" },
    { value: 1e3, symbol: "K" },
  ];

  for (const { value, symbol } of units) {
    if (Math.abs(n) >= value) {
      const scaled = n / value;
      const short = scaled.toFixed(2).replace(/\.0+$|(\.[0-9]*[1-9])0+$/, "$1");
      return `${short}${symbol}`;
    }
  }

  const formatted =
    Math.abs(n) < 10 ? n.toFixed(2) : Math.abs(n) < 100 ? n.toFixed(1) : Math.round(n).toString();

  return formatted.replace(/(\.\d*?[1-9])0+$|\.0+$/, "$1");
};

export const formatDate = (dateStr, type) => {
  if (!dateStr) return "";

  const d = dayjs(dateStr);
  if (!d.isValid()) return dateStr;
  switch (type) {
    case "d":
      return d.format("DD/MM/YYYY");
    case "m":
      return d.format("MM/YYYY");
    case "y":
      return d.format("DD/MM/YYYY");
    case "h":
      return d.format("DD/MM HH:mm");
    case "date":
      return d.format("DD/MM HH:mm");
    case "month":
      return d.format("DD/MM/YYYY");
    case "dateTime":
      return d.format("DD/MM/YYYY HH:mm:ss");
    default:
      return d.format("DD/MM/YYYY HH:mm");
  }
};

export const formatPretty = (
  value,
  { locale = "en-US", maxFraction = 2, dashOnEmpty = true } = {}
) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return dashOnEmpty ? "--" : "";

  return new Intl.NumberFormat(locale, {
    useGrouping: true,
    minimumFractionDigits: 0,
    maximumFractionDigits: maxFraction,
  }).format(n);
};

// formatTimeReport.js
import { Box } from "@mui/material";

export const formatTimeReport = (seconds, { t } = {}) => {
  const n = Number(seconds);
  if (!Number.isFinite(n)) return "--";

  const total = Math.max(0, Math.floor(n));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad2 = (v) => String(v).padStart(2, "0");

  const H = t ? t("report:time:h") : "h";
  const M = t ? t("report:time:m") : "m";
  const S = t ? t("report:time:s") : "s";

  const Group = ({ n, u }) => (
    <Box component="span" sx={{ display: "inline-flex", alignItems: "baseline", gap: 0.75 }}>
      <Box component="span" sx={{ fontWeight: 900, fontSize: { xs: 18, sm: 20 }, lineHeight: 1.2 }}>
        {pad2(n)}
      </Box>
      <Box component="span" sx={{ fontSize: { xs: 12, sm: 16 }, opacity: 0.9, lineHeight: 1.2 }}>
        {u}
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{ display: "flex", flexWrap: "wrap", columnGap: 1, rowGap: 0.5, alignItems: "baseline" }}
    >
      <Group n={h} u={H} />
      <Group n={m} u={M} />
      <Group n={s} u={S} />
    </Box>
  );
};
