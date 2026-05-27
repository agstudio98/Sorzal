/**
 * Removes the pattern "#number" from a string.
 * Example: "Photo Name #1" -> "Photo Name"
 * Example: "Landscape#123" -> "Landscape"
 */
export const cleanTitle = (title: string): string => {
  if (!title) return '';
  return title.replace(/\s*#\d+/, '').trim();
};
