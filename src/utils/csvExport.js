/**
 * VoltFlow Enterprise CSV Export Utility
 * Handles proper CSV quoting, character escaping, and browser file download
 */

export function exportToCSV(filename, headers, rows) {
  if (!rows || !rows.length) {
    alert("No data available to export.");
    return false;
  }

  // Escape special characters and wrap fields in quotes
  const escapeCell = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headerLine = headers.map((h) => escapeCell(h.label || h.title || h)).join(",");
  const dataLines = rows.map((row) => {
    return headers
      .map((h) => {
        const key = h.key || h.accessor || h;
        const value = typeof key === "function" ? key(row) : row[key];
        return escapeCell(value);
      })
      .join(",");
  });

  const csvContent = "\uFEFF" + [headerLine, ...dataLines].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  const cleanFilename = `${filename.replace(/\.csv$/, "")}_${new Date().toISOString().slice(0, 10)}.csv`;
  link.setAttribute("download", cleanFilename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
}
