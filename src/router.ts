import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import { db } from './db/index.ts';
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
} from './db/schema.ts';
import { eq, and, sql, desc } from 'drizzle-orm';
import { adminAuth } from './lib/firebase-admin.ts';
import { verifyAdminSessionToken } from './lib/admin-session.ts';
import superjson from 'superjson';

export const createContext = async ({ req }: { req: any }) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: null };
  }
  
  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) {
    return { user: null };
  }

  if (token.startsWith('admin.')) {
    const tokenSecret = process.env.ADMIN_TOKEN_SECRET;
    if (!tokenSecret) {
      return { user: null };
    }

    const session = verifyAdminSessionToken(token, tokenSecret);
    if (!session) {
      return { user: null };
    }

    const [adminUser] = await db.select().from(users).where(and(
      eq(users.id, session.userId),
      eq(users.role, 'GENERAL_MANAGER'),
    ));
    return { user: adminUser || null };
  }

  // Direct Staff credential token support: user_token_<id>
  if (token.startsWith('user_token_')) {
    const userId = parseInt(token.replace('user_token_', ''));
    if (!isNaN(userId)) {
      const [staffUser] = await db.select().from(users).where(eq(users.id, userId));
      return { user: staffUser || null };
    }
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

  // Public Login with Username/Email and Password
  loginWithCredentials: t.procedure.input(z.object({
    username: z.string(),
    password: z.string(),
  })).mutation(async ({ input }) => {
    const cleanUser = input.username.trim();
    // 1. Check if General Manager admin credentials
    if ((cleanUser.toLowerCase() === 'admin' || cleanUser.toLowerCase() === 'admin@kingfish.com') && input.password === 'admin123') {
      const [adminUser] = await db.select().from(users).where(eq(users.role, 'GENERAL_MANAGER'));
      return {
        success: true,
        token: 'admin_authorized_token_kf_2024',
        user: adminUser,
      };
    }

    // 2. Check in database for staff members created by General Manager
    const [staff] = await db.select().from(users).where(
      sql`lower(${users.email}) = lower(${cleanUser})`
    );

    if (staff && staff.password && staff.password === input.password) {
      return {
        success: true,
        token: `user_token_${staff.id}`,
        user: staff,
      };
    }

    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Invalid username or password',
    });
  }),

  // User Management
  listUsers: t.procedure.use(isAdmin).query(async ({ ctx }) => {
    return await db.select().from(users).where(eq(users.orgId, ctx.user.orgId));
  }),

  createUser: t.procedure.use(isAdmin).input(z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(4),
    role: z.enum(['RECEIVING_OPERATOR', 'QUALITY_MANAGER', 'PRODUCTION_SUPERVISOR', 'WAREHOUSE_OPERATOR', 'EXPORT_OPERATOR']),
    branchId: z.number(),
  })).mutation(async ({ ctx, input }) => {
    const [newUser] = await db.insert(users).values({
      uid: `staff_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      email: input.email.trim().toLowerCase(),
      password: input.password,
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
