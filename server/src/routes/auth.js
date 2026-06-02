import { Router } from 'express';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { signToken, requireAuth } from '../middleware/auth.js';
import { authRateLimit } from '../middleware/rateLimit.js';
import { verifyFirebaseIdToken } from '../services/firebaseService.js';

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

router.post('/google', authRateLimit, async (req, res, next) => {
  try {
    const { idToken, firstName, lastName } = req.body;
    if (!idToken) return res.status(400).json({ error: 'Missing ID token' });

    const projectId = process.env.FIREBASE_PROJECT_ID;
    if (!projectId) {
      return res.status(500).json({ error: 'Server Firebase configuration missing' });
    }

    let payload;
    try {
      payload = await verifyFirebaseIdToken(idToken, projectId);
    } catch (err) {
      console.error('Firebase token verification failed:', err);
      return res.status(401).json({ error: 'Invalid Google identity token' });
    }

    const email = payload.email;
    const uid = payload.sub;

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      const passwordHash = await bcrypt.hash(uid + Math.random(), 12);
      user = await prisma.user.create({
        data: {
          email,
          firstName: firstName || payload.name?.split(' ')[0] || 'Google',
          lastName: lastName || payload.name?.split(' ').slice(1).join(' ') || 'User',
          passwordHash,
          role: 'CLIENT',
        },
      });
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
  } catch (err) {
    next(err);
  }
});

router.post('/google-demo', authRateLimit, async (req, res, next) => {
  try {
    const { email, firstName, lastName } = req.body;
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      const passwordHash = await bcrypt.hash('google-demo-pass', 12);
      user = await prisma.user.create({
        data: {
          email: email || 'google-client@demo.com',
          firstName: firstName || 'Google',
          lastName: lastName || 'User',
          passwordHash,
          role: 'CLIENT',
          state: 'Delhi',
          city: 'New Delhi',
        },
      });
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
  } catch (err) {
    next(err);
  }
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

export default router;

