import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const consultations = await prisma.consultation.findMany({
      where: { clientId: req.user.id },
      include: {
        lawyer: { include: { user: { select: { firstName: true, lastName: true } } } },
      },
      orderBy: { date: 'desc' },
    });
    res.json(consultations);
  } catch (e) {
    next(e);
  }
});

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const lawyer = await prisma.lawyerProfile.findUnique({ where: { id: req.body.lawyerId } });
    if (!lawyer) return res.status(404).json({ error: 'Lawyer not found' });

    const consultation = await prisma.consultation.create({
      data: {
        clientId: req.user.id,
        lawyerId: req.body.lawyerId,
        date: new Date(req.body.date),
        duration: req.body.duration || 30,
        mode: req.body.mode || 'video',
        notes: req.body.notes,
        fee: req.body.fee || lawyer.feeConsultation,
        status: 'pending',
      },
    });
    res.status(201).json(consultation);
  } catch (e) {
    next(e);
  }
});

export default router;
