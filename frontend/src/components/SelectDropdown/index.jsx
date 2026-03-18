import React from "react";
import Html from "./html";

const SelectDropdown = ({
  intialValue = "",
  options = [],
  error = false,
  valueType = "string",
  className = "",
  onInputChange = () => {},
  result = () => {},
  displayValue = "name",
  id = "",
  placeholder = "Select",
  disabled = false,
  name = "",
  required = false,
  theme = "normal",
  isClearable = true,
  hideDefaultPosition = false,
}) => {
  const handleChange = (value) => {
    let finalValue = value;

    if (valueType === "object") {
      finalValue = options.find((itm) => itm.id === value) || null;
    }

    result({ event: "value", value: finalValue });
  };

  return (
    <Html
      id={id}
      className={className}
      name={name}
      required={required}
      theme={theme}
      disabled={disabled}
      placeholder={placeholder}
      displayValue={displayValue}
      options={options}
      selectedValues={intialValue}
      handleChange={handleChange}
      hideDefaultPosition={hideDefaultPosition}
      isClearable={isClearable}
      onInputChange={onInputChange}
      error={error}
    />
  );
};

export default SelectDropdown;
