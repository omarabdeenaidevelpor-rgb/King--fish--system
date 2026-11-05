declare global {
  var process: {
    env: Record<string, string | undefined>;
    exitCode?: number;
  };
}

const nodeRequire = Function('return require')() as {
  (id: string): any;
};

const { randomUUID } = nodeRequire('node:crypto') as {
  randomUUID: () => string;
};
const { mkdir } = nodeRequire('node:fs/promises') as {
  mkdir: (path: string, options?: { recursive?: boolean }) => Promise<void>;
};
const path = nodeRequire('node:path') as {
  resolve: (...paths: string[]) => string;
  extname: (value: string) => string;
  join: (...paths: string[]) => string;
  posix: { basename: (value: string) => string };
};

type RequestHandler = (req: any, res: any, next: (error?: unknown) => void) => void;
type ErrorRequestHandler = (
  error: any,
  req: any,
  res: any,
  next: (error?: unknown) => void,
) => void;

const cors = nodeRequire('cors') as (options?: unknown) => any;
const express = nodeRequire('express') as any;
const multer = nodeRequire('multer') as any;
const { and, eq } = nodeRequire('drizzle-orm') as any;
const { createExpressMiddleware } = nodeRequire('@trpc/server/adapters/express') as any;
const { createServer } = nodeRequire('vite') as any;
import { db } from './src/db/index.ts';
import { documents, users } from './src/db/schema.ts';
import { createContext, kingFishRouter } from './src/router.ts';
import {
  createAdminSessionToken,
  getAdminAuthConfig,
  secureCompare,
} from './src/lib/admin-session.ts';

type AuthenticatedUser = NonNullable<
  Awaited<ReturnType<typeof createContext>>['user']
>;

declare global {
  namespace Express {
    interface Locals {
      authenticatedUser?: AuthenticatedUser;
    }
  }
}

const port = Number(process.env.PORT ?? 3000);
const uploadDirectory = path.resolve('public/uploads');
const maxUploadSizeBytes = 10 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: uploadDirectory,
  filename: (_req: any, file: any, callback: (error: Error | null, filename?: string) => void) => {
    const normalizedName = file.originalname.replace(/\\/g, '/');
    const extension = path.extname(path.posix.basename(normalizedName)).slice(0, 20);
    callback(null, `${randomUUID()}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: maxUploadSizeBytes,
    files: 1,
  },
});

const authenticateUpload: RequestHandler = (req, res, next) => {
  void createContext({ req })
    .then(({ user }) => {
      if (!user) {
        res.status(401).json({ error: 'Authentication required.' });
        return;
      }

      res.locals.authenticatedUser = user;
      next();
    })
    .catch(next);
};

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (res.headersSent) {
    return;
  }

  if (error instanceof multer.MulterError) {
    const statusCode = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    res.status(statusCode).json({
      error: error.code === 'LIMIT_FILE_SIZE'
        ? 'The uploaded file exceeds the 10 MB limit.'
        : 'The uploaded file is invalid.',
    });
    return;
  }

  if (error instanceof SyntaxError && 'body' in error) {
    res.status(400).json({ error: 'Invalid JSON request body.' });
    return;
  }

  console.error('Unhandled server error:', error);
  res.status(500).json({ error: 'An unexpected server error occurred.' });
};

async function startServer(): Promise<void> {
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be a valid TCP port between 1 and 65535.');
  }

  await mkdir(uploadDirectory, { recursive: true });

  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '16kb' }));
  app.use('/uploads', express.static(uploadDirectory));

  app.post('/api/admin/login', async (req: any, res: any, next: any) => {
    res.setHeader('Cache-Control', 'no-store');

    const { username, password } = req.body ?? {};
    if (
      typeof username !== 'string'
      || username.length > 128
      || typeof password !== 'string'
      || password.length > 1024
    ) {
      res.status(400).json({ error: 'Username and password are required.' });
      return;
    }

    try {
      const config = getAdminAuthConfig();
      if (
        !secureCompare(username, config.username)
        || !secureCompare(password, config.password)
      ) {
        res.status(401).json({ error: 'Invalid credentials.' });
        return;
      }

      const [adminUser] = await db.select().from(users).where(and(
        eq(users.email, config.email),
        eq(users.role, 'GENERAL_MANAGER'),
      ));

      if (!adminUser) {
        console.error(`Configured admin account ${config.email} was not found.`);
        res.status(503).json({ error: 'The administrator account is not configured.' });
        return;
      }

      res.json({
        token: createAdminSessionToken(adminUser.id, config.tokenSecret),
      });
    } catch (error) {
      next(error);
    }
  });

  app.post(
    '/api/upload',
    authenticateUpload,
    upload.single('file'),
    async (req: any, res: any, next: any) => {
      const user = res.locals.authenticatedUser;
      if (!user) {
        res.status(401).json({ error: 'Authentication required.' });
        return;
      }

      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded.' });
        return;
      }

      try {
        const [document] = await db.insert(documents).values({
          orgId: user.orgId,
          ownerId: user.id,
          name: req.file.originalname,
          fileType: req.file.mimetype,
          storagePath: `/uploads/${req.file.filename}`,
          linkedEntityType: typeof req.body.linkedEntityType === 'string'
            ? req.body.linkedEntityType
            : null,
          linkedEntityId: typeof req.body.linkedEntityId === 'string'
            ? req.body.linkedEntityId
            : null,
        }).returning();

        res.json(document);
      } catch (error) {
        next(error);
      }
    },
  );

  app.use(
    '/trpc',
    createExpressMiddleware({
      router: kingFishRouter,
      createContext,
    }),
  );

  if (process.env.NODE_ENV === 'production') {
    const distDirectory = path.resolve('dist');
    app.use(express.static(distDirectory));
    app.get('*', (_req: any, res: any) => {
      res.sendFile(path.join(distDirectory, 'index.html'));
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
  }

  app.use(errorHandler);
  app.listen(port, '0.0.0.0', () => {
    console.log(`King Fish system running at http://0.0.0.0:${port}`);
  });
}

startServer().catch((error: unknown) => {
  console.error('Failed to start King Fish system:', error);
  process.exitCode = 1;
});
