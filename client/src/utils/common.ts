export const getValueFromPath = (obj: any, path: string[] | string): any => {
  if (typeof path === "string") {
    return obj[path];
  }
  return path.reduce((acc, key) => {
    return acc && acc[key] !== undefined ? acc[key] : undefined;
  }, obj);
};

export const prettyObject = (
  obj: any,
  deletes: any[] = [undefined, "", null]
) => {
  Object.keys(obj).forEach((key) => {
    const value = obj[key];

    if (value && typeof value === "object") {
      // Đệ quy vào các object lồng nhau
      prettyObject(value, deletes);

      // Xóa object nếu nó không còn thuộc tính nào sau khi xóa
      if (Object.keys(value).length === 0) {
        delete obj[key];
      }
    } else if (deletes.includes(value)) {
      // Xóa thuộc tính nếu giá trị là undefined
      delete obj[key];
    }
  });

  return obj;
};

export const compareObjects = (
  obj1: any,
  obj2: any,
  options?: { isPretty?: boolean }
): boolean => {
  // Check if both inputs are objects
  if (typeof obj1 !== "object" || typeof obj2 !== "object") {
    return false;
  }
  if (options && options["isPretty"]) {
    obj1 = prettyObject(obj1);
    obj2 = prettyObject(obj2);
  }

  // Get the keys of both objects
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  // Check if the number of keys is the same
  if (keys1.length !== keys2.length) {
    return false;
  }

  // Iterate through the keys of the first object
  for (const key of keys1) {
    const val1 = obj1[key];
    const val2 = obj2[key];

    // Nếu là array, so sánh từng phần tử theo thứ tự
    if (Array.isArray(val1) && Array.isArray(val2)) {
      if (val1.length !== val2.length) return false;

      // So sánh từng phần tử trong array (bao gồm thứ tự)
      for (let i = 0; i < val1.length; i++) {
        if (val1[i] !== val2[i]) return false;
        // if (!compareObjects(val1[i], val2[i], options)) {
        //   return false;
        // }
      }
    }
    // Nếu là object, gọi lại hàm compareObjects (đệ quy)
    else if (typeof val1 === "object" && typeof val2 === "object") {
      if (!compareObjects(val1, val2, options)) {
        return false;
      }
    }
    // Nếu là kiểu dữ liệu nguyên thủy, so sánh trực tiếp
    else if (val1 !== val2) {
      return false;
    }
  }

  return true; // All properties have the same values
};

export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const prettyMessage = (jsonString: string) => {
  try {
    // Parse the JSON string into an object
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Invalid JSON string:", error);
  }
  return null;
};
