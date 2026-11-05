import express from 'express';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { createContext, kingFishRouter } from './src/router.ts';
import { createServer } from 'vite';
import path from 'path';
import * as dotenv from 'dotenv';
import cors from 'cors';
import multer from 'multer';
import { db } from './src/db/index.ts';
import { documents, users } from './src/db/schema.ts';
import { eq } from 'drizzle-orm';
import { adminAuth } from './src/lib/firebase-admin.ts';

dotenv.config();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

async function startServer() {
  const app = express();
  const port = 3000;

  app.use(cors());
  app.use(express.json());
  app.use('/uploads', express.static(path.resolve('public/uploads')));

  // File Upload Route
  app.post('/api/upload', upload.single('file'), async (req: any, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const token = authHeader.split(' ')[1];
      const decodedToken = await adminAuth.verifyIdToken(token);
      
      const [user] = await db.select().from(users).where(eq(users.uid, decodedToken.uid));
      if (!user) return res.status(403).json({ error: 'User not found' });

      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const [doc] = await db.insert(documents).values({
        orgId: user.orgId,
        ownerId: user.id,
        name: req.file.originalname,
        fileType: req.file.mimetype,
        storagePath: `/uploads/${req.file.filename}`,
        linkedEntityType: req.body.linkedEntityType || null,
        linkedEntityId: req.body.linkedEntityId || null,
      }).returning();

      res.json(doc);
    } catch (error: any) {
      console.error('Upload error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // tRPC Middleware
  app.use(
    '/trpc',
    createExpressMiddleware({
      router: kingFishRouter,
      createContext,
    })
  );

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist', 'index.html'));
    });
    app.listen(port, '0.0.0.0', () => {
      console.log(`King Fish system running at http://0.0.0.0:${port}`);
    });
  } else {
    const vite = await createServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true' ? { port: 24679 } : false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    app.listen(port, '0.0.0.0', () => {
      console.log(`King Fish system running at http://0.0.0.0:${port}`);
    });
  }
}

startServer().catch(console.error);
