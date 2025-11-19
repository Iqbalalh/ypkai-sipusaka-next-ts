import React, { useState, useEffect } from "react";

export interface Option {
  value: string | boolean | number;
  label: string | boolean | number;
}

interface SelectProps {
  options: Option[];
  placeholder?: string;
  onChange: (value: string | boolean | number) => void;
  className?: string;
  defaultValue?: string | boolean | number;
  value?: string | boolean | number; // controlled mode
  disabled?: boolean;
}

const Select: React.FC<SelectProps> = ({
  options,
  placeholder = "Select an option",
  onChange,
  className = "",
  defaultValue = "",
  value,
  disabled = false,
}) => {
  
  // Jika controlled → gunakan value
  // Jika uncontrolled → gunakan internal state
  const [internalValue, setInternalValue] = useState<
    string | boolean | number | ""
  >(defaultValue ?? "");

  // Sync jika defaultValue berubah
  useEffect(() => {
    if (defaultValue !== undefined && value === undefined) {
      setInternalValue(defaultValue);
    }
  }, [defaultValue, value]);

  const selectedValue = value !== undefined ? value : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const raw = e.target.value;

    // Konversi tipe value asal (boolean/number/string)
    const originalOption = options.find((o) => String(o.value) === raw);
    const finalValue = originalOption ? originalOption.value : raw;

    if (value === undefined) {
      setInternalValue(finalValue);
    }

    onChange(finalValue);
  };

  return (
    <select
      className={`h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-11 text-sm shadow-theme-xs 
        placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 
        focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 
        dark:placeholder:text-white/30 dark:focus:border-brand-800 ${className}`}
      value={selectedValue === undefined ? "" : String(selectedValue)}
      disabled={disabled}
      onChange={handleChange}
    >
      {/* Placeholder */}
      <option value="" disabled className="text-gray-400 dark:text-gray-500">
        {placeholder}
      </option>

      {/* List Options */}
      {options.map((option) => (
        <option
          key={option.value.toString()}
          value={String(option.value)}
          className="text-gray-800 dark:bg-gray-900 dark:text-white"
        >
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default Select;
