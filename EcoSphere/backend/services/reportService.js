const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");

/**
 * Generic tabular report generator used by the Custom Report Builder
 * and the fixed Environmental / Social / Governance / ESG Summary reports.
 * `columns` = [{ header, key }], `rows` = array of plain objects.
 */
async function generateExcel(res, { title, columns, rows }) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(title.substring(0, 31));
  sheet.columns = columns.map((c) => ({ header: c.header, key: c.key, width: 22 }));
  sheet.getRow(1).font = { bold: true };
  rows.forEach((row) => sheet.addRow(row));

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", `attachment; filename="${title}.xlsx"`);
  await workbook.xlsx.write(res);
  res.end();
}

function generateCSV(res, { title, columns, rows }) {
  const header = columns.map((c) => `"${c.header}"`).join(",");
  const lines = rows.map((row) =>
    columns.map((c) => `"${String(row[c.key] ?? "").replace(/"/g, '""')}"`).join(",")
  );
  const csv = [header, ...lines].join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="${title}.csv"`);
  res.send(csv);
}

function generatePDF(res, { title, columns, rows }) {
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${title}.pdf"`);

  const doc = new PDFDocument({ margin: 30, size: "A4", layout: "landscape" });
  doc.pipe(res);

  doc.fontSize(16).text(title, { align: "center" });
  doc.moveDown();

  const colWidth = (doc.page.width - 60) / columns.length;
  let y = doc.y;

  doc.fontSize(10).font("Helvetica-Bold");
  columns.forEach((c, i) => {
    doc.text(c.header, 30 + i * colWidth, y, { width: colWidth });
  });
  doc.moveDown();
  doc.font("Helvetica");

  rows.forEach((row) => {
    y = doc.y;
    if (y > doc.page.height - 60) {
      doc.addPage();
      y = doc.y;
    }
    columns.forEach((c, i) => {
      doc.text(String(row[c.key] ?? ""), 30 + i * colWidth, y, { width: colWidth });
    });
    doc.moveDown();
  });

  doc.end();
}

function exportReport(res, format, payload) {
  if (format === "excel") return generateExcel(res, payload);
  if (format === "csv") return generateCSV(res, payload);
  if (format === "pdf") return generatePDF(res, payload);
  res.status(400).json({ success: false, message: "Unsupported export format. Use pdf, excel, or csv." });
}

module.exports = { exportReport };
