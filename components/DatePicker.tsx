"use client";

import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface DatePickerProps {
  value: string; // YYYY-MM-DD format
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  maxDate?: Date;
  minDate?: Date;
}

export default function DatePicker({
  value,
  onChange,
  placeholder = "DD/MM/YYYY",
  className,
  maxDate,
  minDate,
}: DatePickerProps) {
  // Convert YYYY-MM-DD string to Date object
  const selectedDate = value ? new Date(value + "T00:00:00") : null;

  // Convert Date object back to YYYY-MM-DD string
  const handleChange = (date: Date | null) => {
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      onChange(`${year}-${month}-${day}`);
    } else {
      onChange("");
    }
  };

  return (
    <div className="date-picker-wrapper">
      <ReactDatePicker
        selected={selectedDate}
        onChange={handleChange}
        dateFormat="dd/MM/yyyy"
        placeholderText={placeholder}
        className={className || "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer bg-white"}
        wrapperClassName="date-picker-input-wrapper"
        showYearDropdown
        showMonthDropdown
        dropdownMode="select"
        yearDropdownItemNumber={100}
        scrollableYearDropdown
        maxDate={maxDate}
        minDate={minDate}
        popperClassName="date-picker-popper"
        calendarClassName="date-picker-calendar"
      />
    </div>
  );
}
