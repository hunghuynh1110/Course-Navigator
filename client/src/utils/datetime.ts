import { format as formatFn, differenceInYears, isBefore, parseISO } from "date-fns";
import dayjs from "dayjs";

export const formatDate = (date: string | Date, format?: string) => {
  return formatFn(date, format || "dd/MM/yyyy");
};

export const formatDateTime = (date: string | Date, format?: string) => {
  return formatFn(date, format || "dd/MM/yyyy HH:mm:ss");
};

export const formatTime = (time: string, format?: string) => {
  return formatFn(time, format || "HH:mm:ss");
};

export const formatTimeHHMM = (time: string) => {
  return dayjs(time, "HH:mm:ss").format("HH:mm");
};

export function calculateAge(birthdate: string): number {
  const birthDate = parseISO(birthdate); // Parse ISO string into Date object
  const today = new Date();

  let age = differenceInYears(today, birthDate);

  // Adjust for birthdays that haven't occurred yet this year
  const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
  if (isBefore(today, thisYearBirthday)) {
    age--;
  }

  return age;
}
