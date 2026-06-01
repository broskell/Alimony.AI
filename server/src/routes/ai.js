import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import {
  streamChat,
  analyzeCase,
  draftDocument,
  explainSection,
  briefOnPrecedent,
} from '../services/geminiService.js';
import { requireAuth } from '../middleware/auth.js';
import { aiRateLimit } from '../middleware/rateLimit.js';

const router = Router();
const prisma = new PrismaClient();

router.post('/chat', aiRateLimit, requireAuth, async (req, res, next) => {
  try {
    const { messages, sessionId, userContext } = req.body;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let fullText = '';
    await streamChat(messages || [], userContext || '', (chunk) => {
      fullText += chunk;
      res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
    });
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();

    if (sessionId) {
      const session = await prisma.chatSession.findFirst({
        where: { id: sessionId, userId: req.user.id },
      });
      if (session) {
        const msgs = Array.isArray(session.messages) ? session.messages : JSON.parse(session.messages || '[]');
        msgs.push(...(messages || []).slice(-1), { role: 'assistant', content: fullText });
        await prisma.chatSession.update({
          where: { id: sessionId },
          data: { messages: msgs, updatedAt: new Date() },
        });
      }
    }
  } catch (e) {
    if (!res.headersSent) next(e);
    else res.end();
  }
});

router.get('/sessions', requireAuth, async (req, res, next) => {
  try {
    const sessions = await prisma.chatSession.findMany({
      where: { userId: req.user.id },
      orderBy: { updatedAt: 'desc' },
    });
    res.json(sessions);
  } catch (e) {
    next(e);
  }
});

router.post('/sessions', requireAuth, async (req, res, next) => {
  try {
    const session = await prisma.chatSession.create({
      data: { userId: req.user.id, title: req.body.title || 'New session', messages: [] },
    });
    res.status(201).json(session);
  } catch (e) {
    next(e);
  }
});

router.post('/analyze-case', aiRateLimit, requireAuth, async (req, res, next) => {
  try {
    const result = await analyzeCase(req.body.description);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

router.post('/draft-document', aiRateLimit, requireAuth, async (req, res, next) => {
  try {
    const content = await draftDocument(req.body.type, req.body.caseDetails);
    res.json({ content });
  } catch (e) {
    next(e);
  }
});

router.post('/explain-section', aiRateLimit, async (req, res, next) => {
  try {
    const explanation = await explainSection(req.body.actName, req.body.sectionNumber);
    res.json({ explanation });
  } catch (e) {
    next(e);
  }
});

router.post('/brief-precedent', aiRateLimit, async (req, res, next) => {
  try {
    const brief = await briefOnPrecedent(req.body.citation, req.body.facts);
    res.json({ brief });
  } catch (e) {
    next(e);
  }
});

export default router;
