import React from "react";
import BeautifulLoader from "./BeautifulLoader";

const Loader = ({ text = "Loading..." }) => {
  return <BeautifulLoader text={text} fullScreen={false} />;
};

export default Loader;

