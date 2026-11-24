type ExportValue = string | number | null | undefined;

function escapeCsv(value: ExportValue) {
  const text = value == null ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

/**
 * Downloads an Excel-compatible CSV. The UTF-8 BOM makes names and notes open
 * correctly in Microsoft Excel without manual import settings.
 */
export function exportCsv(filename: string, headers: string[], rows: ExportValue[][]) {
  const content = [headers, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\r\n");
  const blob = new Blob(["\uFEFF", content], { type: "text/csv;charset=utf-8" });
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(href);
}
