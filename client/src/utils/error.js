export const handleError = (data) => {
  let result = [];
  try {
    const error = data.error;
    const errArr = error.split(" | ");
    result = errArr.map((err) => {
      let [code, values] = err.split("--");
      values = values?.split(";") || [];
      return {
        code,
        values,
      };
    });
  } catch {}
  return handleDuplicateError(result);
};

const handleDuplicateError = (data) => {
  const consolidated = {};

  data.forEach((item) => {
    const { code, values } = item;

    // Nếu mã code chưa tồn tại trong đối tượng tạm thời, khởi tạo nó
    if (!consolidated[code]) {
      consolidated[code] = {
        code,
        values: [], // [[], []]
      };
    }

    // Gộp các giá trị vào mảng values, loại bỏ trùng lặp
    values.map((value, index) => {
      if (consolidated[code].values[index]) {
        consolidated[code].values[index].push(value);
      } else {
        consolidated[code].values[index] = [value];
      }
    });
  });

  // Chuyển đổi giá trị thành chuỗi
  const result = Object.values(consolidated).map((item) => ({
    code: item.code,
    values: [...item.values.map((e) => e.join(", "))], // Gộp thành chuỗi
  }));

  return result;
};

const arrayToObject = (arr) =>
  arr.reduce((acc, value, index) => {
    acc[index.toString()] = value;
    return acc;
  }, {});
