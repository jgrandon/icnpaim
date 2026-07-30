/**
 * Converts a string to camelCase.
 * e.g., "first_name", "First-Name", or "FIRST NAME" -> "firstName"
 */
function toCamelCase(str) {
  return str
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
    .replace(/^[A-Z]/, (chr) => chr.toLowerCase());
}

/**
 * Recursively turns every attribute/key of an object or array into camelCase.
 */
export function objectToCamelCase(obj) {
  // Return early if the input is not an object or is null
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // Handle arrays by mapping over each item
  if (Array.isArray(obj)) {
    return obj.map(objectToCamelCase);
  }

  // Handle objects by transforming key names recursively
  return Object.keys(obj).reduce((acc, key) => {
    const camelKey = toCamelCase(key);
    acc[camelKey] = objectToCamelCase(obj[key]);
    return acc;
  }, {});
}