import React from "react";
import BeautifulLoader from "./BeautifulLoader";

const PageLoader = ({ text = "Please wait..." }) => {
  return <BeautifulLoader text={text} fullScreen={true} />;
};

export default PageLoader;

