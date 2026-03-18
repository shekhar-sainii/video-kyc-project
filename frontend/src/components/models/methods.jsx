import React from "react";
const find = (arr, value, key = "key") => {
  return arr?.find((itm) => itm[key] === value);
};

const isNumber = (value, { maxLength, max, min }) => {
  let v = value
    .replace(/[^0-9.]/g, "")
    .replace(/(\..*?)\..*/g, "$1");

  if (maxLength && v.length > maxLength) {
    v = v.slice(0, maxLength);
  }

  if (max !== undefined && Number(v) > Number(max)) {
    v = String(max);
  }

  if (min !== undefined && Number(v) < Number(min)) {
    v = String(min);
  }

  return v;
};

const methodModel = {
  find,
  isNumber,
};

export default methodModel;
