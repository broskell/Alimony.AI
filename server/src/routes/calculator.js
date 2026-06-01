import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { calculateAlimony } from '../services/alimonyEngine.js';
import { generateAlimonyPdf } from '../services/pdfService.js';
import { getCalculationRecommendation } from '../services/geminiService.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

router.post('/calculate', optionalAuth, async (req, res, next) => {
  try {
    const inputData = req.body;
    const result = calculateAlimony(inputData);
    result.aiRecommendation = await getCalculationRecommendation(result, inputData);

    let saved = null;
    if (req.user?.id) {
      saved = await prisma.alimonyCal.create({
        data: {
          userId: req.user.id,
          inputData,
          result,
          state: inputData.state || 'Delhi',
          act: inputData.act || 'HMA',
        },
      });
      result.id = saved.id;
    } else {
      result.id = `guest-${Date.now()}`;
    }
    res.json({ result, inputData });
  } catch (e) {
    next(e);
  }
});

router.get('/history', requireAuth, async (req, res, next) => {
  try {
    const history = await prisma.alimonyCal.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    res.json(history);
  } catch (e) {
    next(e);
  }
});

router.get('/:id/pdf', optionalAuth, async (req, res, next) => {
  try {
    let calc;
    let inputData = {};
    let userName = 'Applicant';

    if (req.params.id.startsWith('guest-')) {
      return res.status(400).json({ error: 'Save calculation first to download PDF' });
    }

    const record = await prisma.alimonyCal.findUnique({ where: { id: req.params.id } });
    if (!record) return res.status(404).json({ error: 'Calculation not found' });
    if (record.userId && req.user?.id !== record.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    calc = record.result;
    inputData = record.inputData;
    if (req.user) userName = `${req.user.firstName} ${req.user.lastName}`;

    const pdfUrl = await generateAlimonyPdf(calc, inputData, userName);
    await prisma.alimonyCal.update({ where: { id: record.id }, data: { pdfUrl } });

    const filepath = path.join(__dirname, '../..', pdfUrl);
    const buf = await fs.readFile(filepath);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="alimony-report.pdf"`);
    res.send(buf);
  } catch (e) {
    next(e);
  }
});

export default router;
