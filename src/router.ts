import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import { db, hasDatabaseConfig, isDemoMode } from './db/index.ts';
import {
  users,
  lots,
  organizations,
  branches,
  suppliers,
  storageLocations,
  auditLogs,
  qualityInspections,
  shipments,
  shipmentItems,
  processingEvents,
  documents
  ,currencies
  ,taxRates
} from './db/schema.ts';
import { eq, and, sql, desc } from 'drizzle-orm';
import { adminAuth } from './lib/firebase-admin.ts';
import { createAdminSession, verifyAdminSession } from './lib/session.ts';
import superjson from 'superjson';

const demoAdminUser = {
  id: 1,
  uid: 'demo-admin',
  email: 'admin@kingfish.local',
  name: 'General Manager',
  role: 'GENERAL_MANAGER' as const,
  orgId: 1,
  branchId: 1,
  createdAt: new Date(),
};

export const createContext = async ({ req }: { req: any }) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: null };
  }

  const token = authHeader.split(' ')[1];

  // Server-issued administrator session (credentials are never validated in the browser).
  const session = verifyAdminSession(token);
  if (session) {
    let adminUser;
    if (isDemoMode || !hasDatabaseConfig) {
      adminUser = demoAdminUser;
    } else {
      [adminUser] = await db.select().from(users).where(
        and(eq(users.id, session.userId), eq(users.role, 'GENERAL_MANAGER'))
      );
    }
    return { user: adminUser || null };
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    // Find by UID or Email (to sync first login)
    let [user] = await db.select().from(users).where(eq(users.uid, decodedToken.uid));

    if (!user && decodedToken.email) {
      [user] = await db.select().from(users).where(eq(users.email, decodedToken.email));
      if (user) {
        // Sync UID for first time
        await db.update(users).set({ uid: decodedToken.uid }).where(eq(users.id, user.id));
      }
    }

    return { user: user || null };
  } catch (error) {
    return { user: null };
  }
};

const t = initTRPC.context<Awaited<ReturnType<typeof createContext>>>().create({
  transformer: superjson,
});

const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      user: ctx.user,
    },
  });
});

const isAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.user || ctx.user.role !== 'GENERAL_MANAGER') {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
  return next({
    ctx: {
      user: ctx.user,
    },
  });
});

export const kingFishRouter = t.router({
  // Auth & Profile
  loginWithCredentials: t.procedure.input(z.object({
    username: z.string().min(1).max(100),
    password: z.string().min(1).max(200),
  })).mutation(async ({ input }) => {
    const expectedUsername = process.env.ADMIN_USERNAME || 'admin';
    const expectedPassword = process.env.ADMIN_PASSWORD || 'admin123';
    if (input.username !== expectedUsername || input.password !== expectedPassword) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid credentials' });
    }

    let adminUser;
    try {
      if (isDemoMode || !hasDatabaseConfig) {
        adminUser = demoAdminUser;
      } else {
        [adminUser] = await db.select().from(users).where(eq(users.role, 'GENERAL_MANAGER'));
      }
    } catch (error) {
      console.error('Admin login database error:', error);
      throw new TRPCError({
        code: 'PRECONDITION_FAILED',
        message: 'قاعدة البيانات غير متصلة. اضبط DATABASE_URL ثم شغّل migration وseed قبل تسجيل الدخول.',
        cause: error,
      });
    }
    if (!adminUser) {
      throw new TRPCError({
        code: 'PRECONDITION_FAILED',
        message: 'حساب المدير غير موجود. شغّل npm run db:migrate ثم npm run seed قبل تسجيل الدخول.',
      });
    }
    return { token: createAdminSession(adminUser.id) };
  }),

  me: t.procedure.use(isAuthed).query(async ({ ctx }) => {
    return ctx.user;
  }),

  syncUser: t.procedure.use(({ ctx, next }) => {
    return next({ ctx });
  }).mutation(async () => {
    return { success: true };
  }),

  getOrgInfo: t.procedure.use(isAuthed).query(async ({ ctx }) => {
    const [org] = await db.select().from(organizations).where(eq(organizations.id, ctx.user.orgId));
    return org;
  }),

  // Global ERP foundation: tenant defaults, currencies and tax jurisdictions.
  getGlobalSettings: t.procedure.use(isAuthed).query(async ({ ctx }) => {
    if (isDemoMode || !hasDatabaseConfig) {
      return { organization: { id: 1, name: 'King Fish Co.', countryCode: 'EG', defaultCurrency: 'EGP', defaultLocale: 'ar', defaultTimeZone: 'Africa/Cairo', fiscalYearStartMonth: 1 }, branches: [], taxRates: [], currencies: [] };
    }
    const [organization] = await db.select().from(organizations).where(eq(organizations.id, ctx.user.orgId));
    const organizationBranches = await db.select().from(branches).where(eq(branches.orgId, ctx.user.orgId));
    const organizationTaxRates = await db.select().from(taxRates).where(eq(taxRates.orgId, ctx.user.orgId));
    const activeCurrencies = await db.select().from(currencies).where(eq(currencies.active, true));
    return {
      organization,
      branches: organizationBranches,
      taxRates: organizationTaxRates,
      currencies: activeCurrencies,
    };
  }),

  updateGlobalSettings: t.procedure.use(isAdmin).input(z.object({
    countryCode: z.string().length(2).toUpperCase().optional(),
    defaultCurrency: z.string().length(3).toUpperCase().optional(),
    defaultLocale: z.enum(['ar', 'en', 'it', 'fr', 'es', 'de']).optional(),
    defaultTimeZone: z.string().min(1).max(100).optional(),
    fiscalYearStartMonth: z.number().int().min(1).max(12).optional(),
  })).mutation(async ({ ctx, input }) => {
    const [updated] = await db.update(organizations)
      .set(input)
      .where(eq(organizations.id, ctx.user.orgId))
      .returning();
    await db.insert(auditLogs).values({
      orgId: ctx.user.orgId,
      actorId: ctx.user.id,
      action: 'GLOBAL_SETTINGS_UPDATED',
      entityType: 'ORGANIZATION',
      entityId: String(ctx.user.orgId),
      metadata: JSON.stringify(input),
    });
    return updated;
  }),

  // User Management
  listUsers: t.procedure.use(isAdmin).query(async ({ ctx }) => {
    if (isDemoMode || !hasDatabaseConfig) return [demoAdminUser];
    return await db.select().from(users).where(eq(users.orgId, ctx.user.orgId));
  }),

  createUser: t.procedure.use(isAdmin).input(z.object({
    name: z.string(),
    email: z.string().email(),
    role: z.enum(['RECEIVING_OPERATOR', 'QUALITY_MANAGER', 'PRODUCTION_SUPERVISOR', 'WAREHOUSE_OPERATOR', 'EXPORT_OPERATOR']),
    branchId: z.number(),
  })).mutation(async ({ ctx, input }) => {
    const [newUser] = await db.insert(users).values({
      uid: `pending_${Math.random().toString(36).substr(2, 9)}`,
      email: input.email,
      name: input.name,
      role: input.role,
      orgId: ctx.user.orgId,
      branchId: input.branchId,
    }).returning();
    return newUser;
  }),

  // Lots
  listLots: t.procedure.use(isAuthed).query(async ({ ctx }) => {
    return await db.select().from(lots)
      .where(eq(lots.orgId, ctx.user.orgId))
      .orderBy(desc(lots.receivedAt));
  }),

  createLot: t.procedure.use(isAuthed).input(z.object({
    lotId: z.string(),
    supplierId: z.number(),
    weight: z.number(),
    temperature: z.number().optional(),
    vesselName: z.string().optional(),
    sourceType: z.string().optional(),
  })).mutation(async ({ ctx, input }) => {
    const [newLot] = await db.insert(lots).values({
      ...input,
      orgId: ctx.user.orgId,
      branchId: ctx.user.branchId!,
      createdBy: ctx.user.id,
    }).returning();

    await db.insert(auditLogs).values({
      orgId: ctx.user.orgId,
      actorId: ctx.user.id,
      action: 'LOT_CREATED',
      entityType: 'LOT',
      entityId: newLot.id.toString(),
      metadata: JSON.stringify(input),
    });

    return newLot;
  }),

  // Suppliers
  listSuppliers: t.procedure.use(isAuthed).query(async ({ ctx }) => {
    return await db.select().from(suppliers).where(eq(suppliers.orgId, ctx.user.orgId));
  }),

  // Processing
  listActiveProcesses: t.procedure.use(isAuthed).query(async ({ ctx }) => {
    return await db.select()
      .from(processingEvents)
      .innerJoin(lots, eq(processingEvents.lotId, lots.id))
      .where(eq(lots.orgId, ctx.user.orgId));
  }),

  // Quality
  listInspections: t.procedure.use(isAuthed).query(async ({ ctx }) => {
    return await db.select({
      id: qualityInspections.id,
      lotId: lots.lotId,
      type: qualityInspections.type,
      parameter: qualityInspections.parameter,
      status: qualityInspections.status,
      value: qualityInspections.value,
      createdAt: qualityInspections.createdAt,
    })
    .from(qualityInspections)
    .innerJoin(lots, eq(qualityInspections.lotId, lots.id))
    .where(eq(qualityInspections.orgId, ctx.user.orgId))
    .orderBy(desc(qualityInspections.createdAt));
  }),

  createInspection: t.procedure.use(isAuthed).input(z.object({
    lotId: z.number(),
    type: z.string(),
    parameter: z.string(),
    value: z.string().optional(),
    status: z.string(),
  })).mutation(async ({ ctx, input }) => {
    return await db.insert(qualityInspections).values({
      ...input,
      orgId: ctx.user.orgId,
      inspectorId: ctx.user.id,
    }).returning();
  }),

  // Shipments
  listShipments: t.procedure.use(isAuthed).query(async ({ ctx }) => {
    return await db.select().from(shipments)
      .where(eq(shipments.orgId, ctx.user.orgId))
      .orderBy(desc(shipments.createdAt));
  }),

  createShipment: t.procedure.use(isAuthed).input(z.object({
    shipmentNumber: z.string(),
    customerName: z.string(),
    destination: z.string(),
    vesselName: z.string().optional(),
  })).mutation(async ({ ctx, input }) => {
    return await db.insert(shipments).values({
      ...input,
      orgId: ctx.user.orgId,
    }).returning();
  }),

  // Inventory
  listLocations: t.procedure.use(isAuthed).query(async ({ ctx }) => {
    return await db.select().from(storageLocations).where(eq(storageLocations.branchId, ctx.user.branchId!));
  }),

  // Dashboard Stats
  getDashboardStats: t.procedure.use(isAuthed).query(async ({ ctx }) => {
    if (isDemoMode || !hasDatabaseConfig) {
      return { totalLots: 0, totalWeight: 0, activeExports: 0, qualityAlerts: 0 };
    }
    const [lotCount] = await db.select({ count: sql<number>`count(*)` }).from(lots).where(eq(lots.orgId, ctx.user.orgId));
    const [totalWeight] = await db.select({ sum: sql<number>`sum(weight)` }).from(lots).where(eq(lots.orgId, ctx.user.orgId));
    const [activeExports] = await db.select({ count: sql<number>`count(*)` }).from(shipments).where(and(eq(shipments.orgId, ctx.user.orgId), eq(shipments.status, 'IN_TRANSIT')));
    const [qualityAlerts] = await db.select({ count: sql<number>`count(*)` }).from(qualityInspections).where(and(eq(qualityInspections.orgId, ctx.user.orgId), eq(qualityInspections.status, 'FAIL')));

    return {
      totalLots: Number(lotCount.count || 0),
      totalWeight: Number(totalWeight.sum || 0),
      activeExports: Number(activeExports.count || 0),
      qualityAlerts: Number(qualityAlerts.count || 0),
    };
  }),

  // Audit Trail
  getAuditLogs: t.procedure.use(isAuthed).query(async ({ ctx }) => {
    return await db.select().from(auditLogs)
      .where(eq(auditLogs.orgId, ctx.user.orgId))
      .orderBy(desc(auditLogs.createdAt));
  }),
});

export type AppRouter = typeof kingFishRouter;
