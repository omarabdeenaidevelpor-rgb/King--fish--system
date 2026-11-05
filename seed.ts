import { db } from './src/db/index.ts';
import { organizations, branches, users } from './src/db/schema.ts';
import { eq, and } from 'drizzle-orm';

async function seed() {
  console.log('Seeding King Fish baseline data...');

  // 1. Get or Create Organization
  let org = await db.query.organizations.findFirst({
    where: eq(organizations.slug, 'king-fish')
  });

  if (!org) {
    [org] = await db.insert(organizations).values({
      name: 'King Fish Co.',
      slug: 'king-fish'
    }).returning();
  }

  // 2. Create Branches (or find existing)
  let branchEg = await db.query.branches.findFirst({
    where: and(eq(branches.orgId, org.id), eq(branches.name, 'Port Said Factory'))
  });

  if (!branchEg) {
    [branchEg] = await db.insert(branches).values({
      orgId: org.id,
      name: 'Port Said Factory',
      location: 'Port Said, Egypt'
    }).returning();
    
    await db.insert(branches).values({
      orgId: org.id,
      name: 'Italy Branch',
      location: 'Genoa, Italy'
    });
  }

  // 3. Initial GM (Current User)
  await db.insert(users).values({
    uid: 'placeholder_will_be_synced',
    email: 'omarabdeenaidevelpor@gmail.com',
    name: 'Omar Abdeen (Admin)',
    role: 'GENERAL_MANAGER',
    orgId: org.id,
    branchId: branchEg.id,
  }).onConflictDoUpdate({
    target: users.email,
    set: { role: 'GENERAL_MANAGER' }
  });

  console.log('Seeding completed successfully.');
}

seed().catch(console.error);
