import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req, res, next) => {
  try {
    const { state, city, specialization, language, maxFee, available, verified } = req.query;
    const where = {};

    if (state) where.state = { contains: state, mode: 'insensitive' };
    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (available === 'true') where.available = true;
    if (verified === 'true') where.verified = true;
    if (maxFee) where.feePerHour = { lte: parseInt(maxFee, 10) };
    if (specialization) {
      where.specializations = { hasSome: specialization.split(',') };
    }
    if (language) {
      where.languages = { hasSome: language.split(',') };
    }

    const lawyers = await prisma.lawyerProfile.findMany({
      where,
      include: {
        user: { select: { firstName: true, lastName: true, email: true, avatar: true } },
      },
      orderBy: [{ rating: 'desc' }, { reviewCount: 'desc' }],
    });
    res.json(lawyers);
  } catch (e) {
    next(e);
  }
});

router.get('/saved', requireAuth, async (req, res, next) => {
  try {
    const saved = await prisma.savedLawyer.findMany({
      where: { userId: req.user.id },
    });
    const ids = saved.map((s) => s.lawyerId);
    const lawyers = await prisma.lawyerProfile.findMany({
      where: { id: { in: ids } },
      include: { user: { select: { firstName: true, lastName: true, avatar: true } } },
    });
    res.json(lawyers);
  } catch (e) {
    next(e);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const lawyer = await prisma.lawyerProfile.findUnique({
      where: { id: req.params.id },
      include: { user: { select: { firstName: true, lastName: true, email: true, avatar: true, phone: true } } },
    });
    if (!lawyer) return res.status(404).json({ error: 'Lawyer not found' });
    res.json(lawyer);
  } catch (e) {
    next(e);
  }
});

router.post('/:id/save', requireAuth, async (req, res, next) => {
  try {
    await prisma.savedLawyer.upsert({
      where: { userId_lawyerId: { userId: req.user.id, lawyerId: req.params.id } },
      create: { userId: req.user.id, lawyerId: req.params.id },
      update: {},
    });
    res.json({ saved: true });
  } catch (e) {
    next(e);
  }
});

export default router;
