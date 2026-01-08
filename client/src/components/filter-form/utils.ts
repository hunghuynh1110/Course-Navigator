import TextFieldsOutlinedIcon from "@mui/icons-material/TextFieldsOutlined";
import NumbersOutlinedIcon from "@mui/icons-material/NumbersOutlined";
import PasswordOutlinedIcon from "@mui/icons-material/PasswordOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import FormatListBulletedOutlinedIcon from "@mui/icons-material/FormatListBulletedOutlined";
import ToggleOnOutlinedIcon from "@mui/icons-material/ToggleOnOutlined";
import RadioButtonCheckedOutlinedIcon from "@mui/icons-material/RadioButtonCheckedOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import ViewModuleOutlinedIcon from "@mui/icons-material/ViewModuleOutlined";
import ViewArrayOutlinedIcon from "@mui/icons-material/ViewArrayOutlined";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import dayjs from "dayjs";
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";
import { PlagiarismOutlined } from "@mui/icons-material";
import type { FormFieldItemType } from "../form";
import type { FilterFieldItem, FilterIcon } from "./types";
import { DATE_FORMAT, DATETIME_FORMAT } from "@/constants/date";

export const ICON_BY_TYPE: Record<FormFieldItemType, FilterIcon> = {
  text: TextFieldsOutlinedIcon,
  area: EditNoteOutlinedIcon,
  number: NumbersOutlinedIcon,
  password: PasswordOutlinedIcon,
  date: CalendarTodayOutlinedIcon,
  dateTime: EventNoteOutlinedIcon,
  time: CalendarTodayOutlinedIcon,
  autocomplete: PlagiarismOutlined,
  select: FormatListBulletedOutlinedIcon,
  radio: RadioButtonCheckedOutlinedIcon,
  upload: CloudUploadOutlinedIcon,
  group: ViewModuleOutlinedIcon,
  groupArray: ViewArrayOutlinedIcon,
  toggle: ToggleOnOutlinedIcon,
  location: ToggleOnOutlinedIcon,
};

export const DefaultFilterItemIcon = TextFieldsOutlinedIcon;

export const getFilterIcon = (item: FilterFieldItem): FilterIcon => {
  const DefaultIcon = ICON_BY_TYPE[item.type as FormFieldItemType];
  const IconComp = item.Icon ?? DefaultIcon;
  return IconComp ?? DefaultFilterItemIcon;
};

export const FILTER_FORM_SIZE = {
  small: 1,
  medium: 1.5,
  large: 2,
};

export const getFilterLabel = (value: any, item: FilterFieldItem): string => {
  // Nếu không có value → trả chuỗi rỗng
  if (value == null || value === "") return "";

  // Các type có options
  const hasOptions = !item.isArray && (item.type === "select" || item.type === "radio");

  if (hasOptions && "options" in item) {
    const found = item.options.find((opt) => opt.value === value);
    return found ? found.label : String(value);
  }

  if (item.type === "date") {
    return dayjs(value).format(DATE_FORMAT);
  }

  if (item.type === "dateTime") {
    return dayjs(value).format(DATETIME_FORMAT);
  }

  if (item.isArray) {
    if (item.type === "select") {
      return value.map((v: string) => item.options.find((e) => e.value === v)?.label).join(", ");
    }
  }

  return String(value);
};

export const validFilterValue = (value: any) => [null, undefined, NaN, ""].includes(value);

export const isFilterItemArray = (item: FilterFieldItem) => {
  return item.isArray;
};
