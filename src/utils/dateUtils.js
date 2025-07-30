// src/utils/dateUtils.js

// Function to get the current date set to midnight in Peru timezone (UTC-5)
export function getPeruTimezoneDate() {
  const now = new Date();
  // Create a date object for midnight in the local timezone.
  // JavaScript's Date object inherently uses the system's local timezone.
  // For 'America/Lima' (UTC-5), this will correctly represent midnight.
  const peruDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return peruDate;
}

// Function to format a Date object to YYYY-MM-DD string using local time components
export function formatDateToYYYYMMDD(date) {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Function to parse a YYYY-MM-DD string into a Date object at midnight in local time
export function parseYYYYMMDD(dateString) {
  if (!dateString) return null;
  const dateParts = dateString.split('-');
  // Use the year, monthIndex, day constructor to ensure local midnight
  return new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
}
