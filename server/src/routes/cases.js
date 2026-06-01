import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth.js';
import { analyzeCase } from '../services/geminiService.js';

const router = Router();
const prisma = new PrismaClient();

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const where = req.user.role === 'LAWYER'
      ? { lawyer: { userId: req.user.id } }
      : { clientId: req.user.id };

    const cases = await prisma.case.findMany({
      where,
      include: {
        hearings: { orderBy: { date: 'desc' }, take: 1 },
        lawyer: { include: { user: { select: { firstName: true, lastName: true } } } },
      },
      orderBy: { updatedAt: 'desc' },
    });
    res.json(cases);
  } catch (e) {
    next(e);
  }
});

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const data = req.body;
    const caseRecord = await prisma.case.create({
      data: {
        caseNumber: data.caseNumber || `MACT/${new Date().getFullYear()}/${Math.floor(Math.random() * 999999)}`,
        title: data.title,
        court: data.court,
        state: data.state,
        clientId: req.user.id,
        lawyerId: data.lawyerId,
        filingDate: new Date(data.filingDate || Date.now()),
        nextHearing: data.nextHearing ? new Date(data.nextHearing) : null,
        acts: data.acts || [],
        sections: data.sections || [],
        description: data.description || '',
        status: data.status || 'ACTIVE',
      },
    });
    res.status(201).json(caseRecord);
  } catch (e) {
    next(e);
  }
});

router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const caseRecord = await prisma.case.findUnique({
      where: { id: req.params.id },
      include: {
        hearings: { orderBy: { date: 'asc' } },
        documents: true,
        lawyer: { include: { user: { select: { firstName: true, lastName: true } } } },
        client: { select: { firstName: true, lastName: true } },
      },
    });
    if (!caseRecord) return res.status(404).json({ error: 'Case not found' });
    if (caseRecord.clientId !== req.user.id && req.user.role !== 'ADMIN') {
      const lawyer = await prisma.lawyerProfile.findFirst({ where: { userId: req.user.id } });
      if (lawyer?.id !== caseRecord.lawyerId) {
        return res.status(403).json({ error: 'Forbidden' });
      }
    }
    res.json(caseRecord);
  } catch (e) {
    next(e);
  }
});

router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const updated = await prisma.case.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(updated);
  } catch (e) {
    next(e);
  }
});

router.post('/:id/hearing', requireAuth, async (req, res, next) => {
  try {
    const hearing = await prisma.hearing.create({
      data: {
        caseId: req.params.id,
        date: new Date(req.body.date),
        court: req.body.court,
        judge: req.body.judge,
        outcome: req.body.outcome,
        notes: req.body.notes,
        nextDate: req.body.nextDate ? new Date(req.body.nextDate) : null,
      },
    });
    if (req.body.nextDate) {
      await prisma.case.update({
        where: { id: req.params.id },
        data: { nextHearing: new Date(req.body.nextDate) },
      });
    }
    res.status(201).json(hearing);
  } catch (e) {
    next(e);
  }
});

router.get('/:id/ai-summary', requireAuth, async (req, res, next) => {
  try {
    const caseRecord = await prisma.case.findUnique({ where: { id: req.params.id } });
    if (!caseRecord) return res.status(404).json({ error: 'Case not found' });

    const analysis = await analyzeCase(caseRecord.description);
    const summary = typeof analysis === 'object' ? analysis.summary : analysis;
    await prisma.case.update({ where: { id: req.params.id }, data: { aiSummary: summary } });
    res.json(analysis);
  } catch (e) {
    next(e);
  }
});

export default router;
