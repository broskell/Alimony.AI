import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/acts', async (_req, res, next) => {
  try {
    const acts = await prisma.legalAct.findMany({
      include: { _count: { select: { sections: true } } },
      orderBy: { year: 'asc' },
    });
    res.json(acts);
  } catch (e) {
    next(e);
  }
});

router.get('/acts/:id/sections', async (req, res, next) => {
  try {
    const sections = await prisma.legalSection.findMany({
      where: { actId: req.params.id },
      orderBy: { number: 'asc' },
    });
    res.json(sections);
  } catch (e) {
    next(e);
  }
});

router.get('/sections/search', async (req, res, next) => {
  try {
    const q = req.query.q || '';
    if (!q) return res.json([]);

    const sections = await prisma.legalSection.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { text: { contains: q, mode: 'insensitive' } },
          { number: { contains: q, mode: 'insensitive' } },
          { keywords: { hasSome: [q.toLowerCase()] } },
        ],
      },
      include: { act: true },
      take: 30,
    });

    const precedents = await prisma.casePrecedent.findMany({
      where: {
        OR: [
          { citation: { contains: q, mode: 'insensitive' } },
          { parties: { contains: q, mode: 'insensitive' } },
          { summary: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 10,
    });

    res.json({ sections, precedents });
  } catch (e) {
    next(e);
  }
});

router.get('/precedents', async (_req, res, next) => {
  try {
    const precedents = await prisma.casePrecedent.findMany({ orderBy: { year: 'desc' } });
    res.json(precedents);
  } catch (e) {
    next(e);
  }
});

export default router;
