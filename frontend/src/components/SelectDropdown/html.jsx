import React from "react";
import { Fragment, useMemo } from "react";
import { useSelector } from "react-redux";
import methodModel from "../models/methods";
import Select from "react-select";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

const Html = ({
  options = [],
  dynamicStyle = false,
  className = "",
  selectedValues = "",
  onInputChange = () => {},
  handleChange = () => {},
  displayValue = "name",
  id = "",
  placeholder = "Select",
  required = false,
  disabled = false,
  error = false,
  name = "",
  noDefault = false,
  hideDefaultPosition = false,
  theme = "normal",
  isClearable = true,
}) => {
  const isDark = useSelector(
    (state) => state.theme.mode === "dark"
  );

  /* ---------------- react-select value ---------------- */
  const selectedOption = useMemo(() => {
    const found = options.find((item) => item.id === selectedValues);
    return found
      ? { value: found.id, label: found[displayValue] }
      : null;
  }, [options, selectedValues, displayValue]);

  /* ---------------- react-select options ---------------- */
  const selectOptions = useMemo(
    () =>
      options.map((itm) => ({
        value: itm.id,
        label: itm[displayValue],
      })),
    [options, displayValue]
  );

  /* ---------------- react-select styles (THEME FIX) ---------------- */
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: "48px",
      backgroundColor: isDark ? "#1f2937" : "#ffffff",
      borderColor: error
        ? "#ef4444"
        : state.isFocused
        ? "#3b82f6"
        : isDark
        ? "#374151"
        : "#d1d5db",
      boxShadow: "none",
      "&:hover": {
        borderColor: state.isFocused
          ? "#3b82f6"
          : isDark
          ? "#4b5563"
          : "#9ca3af",
      },
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: isDark ? "#1f2937" : "#ffffff",
      zIndex: 50,
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused
        ? isDark
          ? "#374151"
          : "#f3f4f6"
        : "transparent",
      color: isDark ? "#e5e7eb" : "#111827",
      cursor: "pointer",
    }),
    singleValue: (base) => ({
      ...base,
      color: isDark ? "#e5e7eb" : "#111827",
    }),
    placeholder: (base) => ({
      ...base,
      color: isDark ? "#9ca3af" : "#6b7280",
    }),
    input: (base) => ({
      ...base,
      color: isDark ? "#e5e7eb" : "#111827",
    }),
  };

  /* ---------------- SEARCH SELECT ---------------- */
  if (theme === "search") {
    return (
      <div className={className}>
        <Select
          options={selectOptions}
          placeholder={placeholder}
          value={selectedOption}
          isClearable={isClearable}
          name={name}
          onInputChange={onInputChange}
          onChange={(e) => handleChange(e?.value || "")}
          isDisabled={disabled}
          className="w-full text-sm"
          styles={selectStyles}
        />
      </div>
    );
  }

  /* ---------------- NORMAL DROPDOWN ---------------- */
  return (
    <div className="selectDropdown">
      <input
        type="hidden"
        name={name}
        value={selectedValues}
        required={required}
      />

      <Menu as="div" className="relative w-full">
        <Menu.Button
          disabled={disabled}
          id={`dropdown_${id}`}
          className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-sm transition
            ${isDark
              ? "bg-gray-800 text-gray-200 border-gray-700 hover:border-gray-600"
              : "bg-white text-gray-800 border-gray-300 hover:border-gray-400"}
            ${error ? "border-red-500" : ""}
            ${disabled ? "opacity-60 cursor-not-allowed" : ""}
            ${className}
          `}
        >
          <span className="truncate">
            {selectedValues
              ? methodModel.find(options, selectedValues, "id")?.[displayValue] ||
                placeholder
              : placeholder}
          </span>
          <ChevronDownIcon
            className={`h-5 w-5
              ${isDark ? "text-gray-400" : "text-gray-500"}
            `}
          />
        </Menu.Button>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <Menu.Items
            className={`absolute z-40 mt-1 w-full rounded-xl shadow-lg overflow-auto
              ${isDark
                ? "bg-gray-800 border border-gray-700"
                : "bg-white border border-gray-200"}
              ${dynamicStyle ? "" : "max-h-60"}
            `}
          >
            {!hideDefaultPosition && !noDefault && (
              <Menu.Item>
                {({ active }) => (
                  <button
                    type="button"
                    onClick={() => handleChange("")}
                    className={`w-full px-4 py-2 text-left text-sm transition
                      ${active
                        ? isDark
                          ? "bg-gray-700"
                          : "bg-gray-100"
                        : ""}
                    `}
                  >
                    {placeholder}
                  </button>
                )}
              </Menu.Item>
            )}

            {options.map((itm) => (
              <Menu.Item key={itm.id}>
                {({ active }) => (
                  <button
                    type="button"
                    onClick={() => handleChange(itm.id)}
                    className={`w-full px-4 py-2 text-left text-sm transition
                      ${
                        selectedValues === itm.id || active
                          ? isDark
                            ? "bg-gray-700"
                            : "bg-gray-100"
                          : ""
                      }
                    `}
                  >
                    {itm[displayValue]}
                  </button>
                )}
              </Menu.Item>
            ))}
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
};

export default Html;
