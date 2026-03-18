import React from "react";
import { useState } from "react";
import { useSelector } from "react-redux";
import methodModel from "./models/methods";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import SelectDropdown from "./SelectDropdown";

export default function FormControl({
  type = "text",
  value = "",
  onChange = () => {},
  options = [],
  placeholder = "",
  displayValue = "name",
  valueType = "string",
  id = "",
  name = "",
  label = "",
  disabled = false,
  required = false,
  error = "",
  min,
  max,
  minLength,
  maxLength,
  className = "",
}) {
  const [showPassword, setShowPassword] = useState(false);

  const isDark = useSelector(
    (state) => state.theme.mode === "dark"
  );

  /* ---------------- BASE STYLES ---------------- */
  const baseClass = `
    w-full h-12 px-3 py-2 rounded-xl border outline-none transition
    ${isDark
      ? "bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-400 focus:border-blue-500"
      : "bg-white border-gray-200 text-gray-800 placeholder-gray-500 focus:border-blue-500"}
    ${disabled ? "opacity-60 cursor-not-allowed" : ""}
    ${error ? "border-red-500 focus:border-red-500" : ""}
    ${className}
  `;

  /* ---------------- LABEL ---------------- */
  const renderLabel = label && (
    <label
      className={`block mb-1 text-sm font-medium
        ${isDark ? "text-gray-300" : "text-gray-700"}
      `}
    >
      {label} {required && <span className="text-red-500">*</span>}
    </label>
  );

  const errorText = error && (
    <p className="text-red-600 text-sm mt-1">{error}</p>
  );

  /* ---------------- NUMBER ---------------- */
  if (type === "number") {
    return (
      <>
        {renderLabel}
        <input
          type="text"
          value={value}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          onChange={(e) =>
            onChange(
              methodModel.isNumber(e.target.value, {
                maxLength,
                max,
                min,
              })
            )
          }
          className={baseClass}
        />
        {errorText}
      </>
    );
  }

  /* ---------------- DATE ---------------- */
  if (type === "date") {
    return (
      <>
        {renderLabel}
        <input
          type="date"
          value={value}
          min={min}
          max={max}
          disabled={disabled}
          required={required}
          onChange={(e) => onChange(e.target.value)}
          className={baseClass}
        />
        {errorText}
      </>
    );
  }

  /* ---------------- PASSWORD ---------------- */
  if (type === "password") {
    return (
      <>
        {renderLabel}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={value}
            disabled={disabled}
            required={required}
            minLength={minLength}
            maxLength={maxLength}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            className={`${baseClass} pr-10`}
          />
          <span
            className={`absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer
              ${isDark ? "text-gray-400" : "text-gray-500"}
            `}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <MdVisibility /> : <MdVisibilityOff />}
          </span>
        </div>
        {errorText}
      </>
    );
  }

  /* ---------------- SEARCH ---------------- */
  if (type === "search") {
    return (
      <>
        {renderLabel}
        <input
          type="search"
          value={value}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={baseClass}
        />
        {errorText}
      </>
    );
  }

  /* ---------------- SELECT ---------------- */
  if (type === "select") {
    return (
      <>
        {renderLabel}
        <select
          value={value}
          disabled={disabled}
          required={required}
          onChange={(e) => onChange(e.target.value)}
          className={baseClass}
        >
          <option value="">
            {placeholder || "Select"}
          </option>
          {options.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt[displayValue]}
            </option>
          ))}
        </select>
        {errorText}
      </>
    );
  }

  /* ---------------- RADIO ---------------- */
  if (type === "radio") {
    return (
      <>
        {renderLabel}
        {options.map((opt) => (
          <label
            key={opt.value}
            className={`mr-4 inline-flex items-center text-sm
              ${isDark ? "text-gray-200" : "text-gray-800"}
            `}
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={(e) => onChange(e.target.value)}
              className="mr-2"
            />
            {opt.label}
          </label>
        ))}
        {errorText}
      </>
    );
  }

  /* ---------------- CHECKBOX ---------------- */
  if (type === "checkbox") {
    return (
      <>
        <label
          className={`inline-flex items-center text-sm
            ${isDark ? "text-gray-200" : "text-gray-800"}
          `}
        >
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
            className="mr-2"
          />
          {label}
        </label>
        {errorText}
      </>
    );
  }

  /* ---------------- TEXTAREA ---------------- */
  if (type === "textarea") {
    return (
      <>
        {renderLabel}
        <textarea
          value={value}
          disabled={disabled}
          required={required}
          minLength={minLength}
          maxLength={maxLength}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={`${baseClass} h-24 resize-none`}
        />
        {errorText}
      </>
    );
  }

  /* ---------------- SEARCH SELECT ---------------- */
  if (type === "SearchSelect") {
    return (
      <>
        {renderLabel}
        <SelectDropdown
          id={id}
          options={options}
          displayValue={displayValue}
          valueType={valueType}
          intialValue={value}
          placeholder={placeholder}
          theme={isDark ? "dark" : "light"}
          disabled={disabled}
          error={!!error}
          result={(e) => onChange(e.value)}
        />
        {errorText}
      </>
    );
  }


    /* ---------------- FILE ---------------- */
  if (type === "file") {
    return (
      <>
        {renderLabel}
        <input
          type="file"
          disabled={disabled}
          required={required}
          accept="image/*"
          onChange={(e) => onChange(e.target.files[0])}
          className={baseClass}
        />
        {errorText}
      </>
    );
  }


  /* ---------------- DEFAULT INPUT ---------------- */
  return (
    <>
      {renderLabel}
      <input
        type={type}
        value={value}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        minLength={minLength}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        className={baseClass}
      />
      {errorText}
    </>
  );
}
