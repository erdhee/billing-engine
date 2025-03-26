export function parseBody<T>(body: any): T {
  const parseValue = (value: any): any => {
    if (Array.isArray(value)) {
      return value.map(parseValue); // Recursively handle arrays
    }
    if (value !== null && typeof value === "object") {
      return Object.fromEntries(
        Object.entries(value).map(([key, val]) => [key, parseValue(val)]),
      ); // Recursively handle objects
    }
    if (typeof value === "string") {
      if (value === "true" || value === "false") return value === "true"; // Convert to boolean
      if (!isNaN(Number(value))) return parseFloat(value); // Convert to number if possible
    }
    return value; // Return as-is for other types
  };

  return parseValue(body);
}
