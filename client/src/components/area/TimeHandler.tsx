export default function TimeHandler(time: { startTime: string; endTime: string } | string) {
  let startTime: string = "00:00:00";
  let endTime: string = "00:00:00";
  if (typeof time === "object" && time) {
    startTime = time.startTime || "00:00:00";
    endTime = time.endTime || "00:00:00";

    if (startTime.split(":").length === 2) {
      startTime = `${startTime}:00`;
    }
    if (endTime.split(":").length === 2) {
      endTime = `${endTime}:00`;
    }
  } else if (typeof time === "string") {
    const normalized = time.trim().toLowerCase();
    if (normalized === "24/7" || normalized === "24-7" || normalized === "24:7") {
      startTime = "00:00:00";
      endTime = "00:00:00";
    } else {
      const parts = time.split("-");
      startTime = parts[0]?.trim() || "00:00:00";
      endTime = parts[1]?.trim() || "00:00:00";

      if (startTime.split(":").length === 2) {
        startTime = `${startTime}:00`;
      }
      if (endTime.split(":").length === 2) {
        endTime = `${endTime}:00`;
      }
    }
  } else {
    startTime = "00:00:00";
    endTime = "00:00:00";
  }
  return { startTime, endTime };
}
