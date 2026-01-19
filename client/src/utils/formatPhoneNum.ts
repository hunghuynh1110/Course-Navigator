const formatPhoneNum = (phoneNum: string | undefined) => {
  if (!phoneNum) return "-";
  if (phoneNum.length !== 10) return phoneNum.replace(/-/g, " ");
  return phoneNum.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3");
};

export default formatPhoneNum;
