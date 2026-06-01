import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, '../../uploads');

async function ensureUploadDir() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

export async function generateAlimonyPdf(calc, inputData, userName = 'Applicant') {
  await ensureUploadDir();
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const gold = rgb(0.79, 0.66, 0.3);
  const dark = rgb(0.05, 0.05, 0.1);
  const muted = rgb(0.4, 0.4, 0.45);

  const page1 = doc.addPage([595, 842]);
  const { height } = page1.getSize();
  let y = height - 50;

  page1.drawText('Alimony.AI · Confidential Report', { x: 50, y, size: 10, font, color: muted });
  y -= 20;
  page1.drawLine({ start: { x: 50, y }, end: { x: 545, y }, thickness: 2, color: gold });
  y -= 30;
  page1.drawText(`IN THE MATTER OF: ${userName.toUpperCase()}`, { x: 50, y, size: 12, font: fontBold, color: dark });
  y -= 15;
  page1.drawLine({ start: { x: 50, y }, end: { x: 545, y }, thickness: 1, color: rgb(0.85, 0.31, 0.24) });
  y -= 35;
  page1.drawText(calc.verdictLabel || 'MONTHLY MAINTENANCE', { x: 50, y, size: 11, font, color: muted });
  y -= 40;
  page1.drawText(`₹${calc.monthly?.toLocaleString('en-IN')}/month`, { x: 50, y, size: 36, font: fontBold, color: gold });
  y -= 30;
  page1.drawText(`${calc.duration} year term · ${inputData?.state || 'India'} · ${calc.act}`, { x: 50, y, size: 10, font, color: muted });
  y -= 40;

  const metrics = [
    ['Annual Total', `₹${calc.annual?.toLocaleString('en-IN')}`],
    ['Duration', `${calc.duration} years`],
    ['Total Payout', `₹${calc.total?.toLocaleString('en-IN')}`],
  ];
  metrics.forEach(([label, val], i) => {
    page1.drawText(label, { x: 50 + i * 170, y, size: 9, font, color: muted });
    page1.drawText(val, { x: 50 + i * 170, y: y - 18, size: 14, font: fontBold, color: dark });
  });
  y -= 50;

  page1.drawText('Calculation Breakdown', { x: 50, y, size: 12, font: fontBold, color: dark });
  y -= 20;
  (calc.breakdown || []).forEach((row) => {
    if (y < 80) return;
    page1.drawText(`${row.factor}: ${row.value} (${row.modifier})`, { x: 50, y, size: 9, font, color: dark });
    y -= 14;
  });

  y -= 10;
  page1.drawText(`${calc.section} · ${calc.supremeCourtRef}`, { x: 50, y, size: 9, font, color: muted });

  const page2 = doc.addPage([595, 842]);
  y = height - 50;
  page2.drawText('AI Recommendation & Legal Notes', { x: 50, y, size: 14, font: fontBold, color: dark });
  y -= 30;
  const rec = calc.aiRecommendation || 'Consult a licensed advocate for case-specific advice.';
  const lines = rec.match(/.{1,90}(\s|$)/g) || [rec];
  lines.forEach((line) => {
    page2.drawText(line.trim(), { x: 50, y, size: 10, font, color: dark });
    y -= 14;
  });
  y -= 20;
  page2.drawText('Relevant Precedents:', { x: 50, y, size: 11, font: fontBold, color: dark });
  y -= 16;
  page2.drawText('Rajnesh v. Neha, (2020) 4 SCC 153 — maintenance guidelines', { x: 50, y, size: 9, font, color: dark });
  y -= 14;
  page2.drawText('Bhuwan Mohan Singh v. Meena, (2015) 6 SCC 353 — parity in maintenance', { x: 50, y, size: 9, font, color: dark });
  y -= 40;
  page2.drawText(
    'DISCLAIMER: This report is for informational purposes only and does not constitute legal advice.',
    { x: 50, y, size: 8, font, color: muted }
  );
  page2.drawText('Built by Saathvik Kellampalli · Consult a licensed advocate', { x: 50, y: 30, size: 8, font, color: muted });

  const pdfBytes = await doc.save();
  const filename = `alimony-${Date.now()}.pdf`;
  const filepath = path.join(UPLOAD_DIR, filename);
  await fs.writeFile(filepath, pdfBytes);
  return `/uploads/${filename}`;
}
