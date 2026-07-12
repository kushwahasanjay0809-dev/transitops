/**
 * CSV Export utility.
 * Converts an array of objects to CSV format and sends it as a download.
 */

/**
 * Convert array of objects to CSV string.
 * @param {object[]} data - Array of flat objects
 * @param {string[]} columns - Ordered column keys to include
 * @param {object} headers - Map of column keys to display headers (optional)
 * @returns {string} CSV formatted string
 */
function toCSV(data, columns, headers = {}) {
  if (!data || data.length === 0) {
    // Return header-only CSV if no data
    const headerRow = columns.map((col) => escapeCSV(headers[col] || col)).join(',');
    return headerRow;
  }

  // Build header row
  const headerRow = columns.map((col) => escapeCSV(headers[col] || col)).join(',');

  // Build data rows
  const dataRows = data.map((row) =>
    columns
      .map((col) => {
        const value = row[col];
        if (value === null || value === undefined) return '';
        return escapeCSV(String(value));
      })
      .join(',')
  );

  return [headerRow, ...dataRows].join('\n');
}

/**
 * Escape a value for CSV (handle commas, quotes, newlines).
 * @param {string} value
 * @returns {string}
 */
function escapeCSV(value) {
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Send CSV as a file download response.
 * @param {import('express').Response} res
 * @param {string} csvContent - CSV string
 * @param {string} filename - Download filename (without extension)
 */
function sendCSV(res, csvContent, filename) {
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const fullFilename = `${filename}_${timestamp}.csv`;

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${fullFilename}"`);
  res.status(200).send(csvContent);
}

module.exports = { toCSV, escapeCSV, sendCSV };
