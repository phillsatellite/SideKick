import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph, TextRun } from "docx";

export async function generateFile(text, format) {
  const timestamp = new Date().toISOString().slice(0, 10);
  const baseName = `sidekick-export-${timestamp}`;

  switch (format) {
    case "txt":
      return {
        blob: new Blob([text], { type: "text/plain" }),
        filename: `${baseName}.txt`,
        mimeType: "text/plain",
      };

    case "md":
      return {
        blob: new Blob([text], { type: "text/markdown" }),
        filename: `${baseName}.md`,
        mimeType: "text/markdown",
      };

    case "pdf": {
      const doc = new jsPDF();
      const margin = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const maxWidth = pageWidth - margin * 2;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);

      // Replace tabs with spaces since jsPDF doesn't render tabs
      const cleaned = text.replace(/\t/g, "    ");
      const lines = doc.splitTextToSize(cleaned, maxWidth);
      let y = margin;
      const lineHeight = 6;

      for (const line of lines) {
        if (y + lineHeight > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(line, margin, y);
        y += lineHeight;
      }

      return {
        blob: doc.output("blob"),
        filename: `${baseName}.pdf`,
        mimeType: "application/pdf",
      };
    }

    case "docx": {
      const paragraphs = text.split(/\n\n+/).map(
        (para) =>
          new Paragraph({
            children: [
              new TextRun({
                text: para.replace(/^\t/, ""),
                font: "Calibri",
                size: 22,
              }),
            ],
            indent: para.startsWith("\t") ? { firstLine: 720 } : undefined,
            spacing: { after: 200 },
          })
      );

      const docxDoc = new Document({
        sections: [{ children: paragraphs }],
      });

      return {
        blob: await Packer.toBlob(docxDoc),
        filename: `${baseName}.docx`,
        mimeType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      };
    }

    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}
