/**
 * Format a date string or Date object to DD/MM/YYYY format
 * @param date - Date string or Date object
 * @returns Formatted date string in DD/MM/YYYY format
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "";
  
  const d = typeof date === "string" ? new Date(date) : date;
  
  if (isNaN(d.getTime())) return "";
  
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear();
  
  return `${day}/${month}/${year}`;
}

/**
 * Format a date for input[type="date"] value (YYYY-MM-DD)
 * @param date - Date string in DD/MM/YYYY or any parseable format
 * @returns Date string in YYYY-MM-DD format for input fields
 */
export function formatDateForInput(date: string | Date | null | undefined): string {
  if (!date) return "";
  
  const d = typeof date === "string" ? new Date(date) : date;
  
  if (isNaN(d.getTime())) return "";
  
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear();
  
  return `${year}-${month}-${day}`;
}
