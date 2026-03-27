export function formatDateTimeIST(dateInput) {
  // Handle empty values
  if (!dateInput) return "-";

  // Convert to Date object
  const date = new Date(dateInput);

  // Handle invalid date
  if (isNaN(date.getTime())) return "-";

  // Format to IST
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",

    year: "numeric",

    month: "2-digit",

    day: "2-digit",

    hour: "2-digit",

    minute: "2-digit",

    hour12: false,
  });

  // Format and remove comma
  const formatted = formatter.format(date).replace(",", "");

  return formatted;
}
