import { Router } from 'express';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { signToken, requireAuth } from '../middleware/auth.js';
import { authRateLimit } from '../middleware/rateLimit.js';

const router = Router();
const prisma = new PrismaClient();

router.post('/register', authRateLimit, async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, role, phone, state, city } = req.body;
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        role: role || 'CLIENT',
        phone,
        state,
        city,
      },
    });
    const token = signToken(user);
    res.status(201).json({
      token,
      user: { id: user.id, email, firstName, lastName, role: user.role, state, city },
    });
  } catch (e) {
    next(e);
  }
});

router.post('/login', authRateLimit, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = signToken(user);
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        state: user.state,
        city: user.city,
      },
    });
  } catch (e) {
    next(e);
  }
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

export default router;
