import { prisma } from '../lib/server/prisma';
import bcrypt from 'bcryptjs';
import { DEPARTMENT_OFFICER_CREDENTIALS, APPROVED_ATTENDEE_CREDENTIALS } from '../lib/auth/officerCredentials';

async function seed() {
  console.log('Clearing existing users...');
  await prisma.user.deleteMany({});
  
  console.log('Seeding Department Officer Credentials...');
  for (const officer of DEPARTMENT_OFFICER_CREDENTIALS) {
    try {
      await prisma.user.create({
        data: {
          email: officer.email,
          name: officer.name,
          role: officer.role,
          departmentId: (officer as any).departmentId || null,
          department: officer.department || null,
          sector: officer.sector || null,
          badgeRole: officer.badgeRole || null,
          passwordHash: bcrypt.hashSync(officer.password || 'default', 10),
        }
      });
      console.log(`Inserted: ${officer.email}`);
    } catch (e: any) {
      console.log(`Skipped (or error): ${officer.email} - ${e.message}`);
    }
  }
  
  console.log('\nSeeding Approved Attendee Credentials (as users)...');
  for (const att of APPROVED_ATTENDEE_CREDENTIALS) {
    try {
      await prisma.user.create({
        data: {
          email: att.email,
          name: att.name,
          role: 'attendee' as any,
          department: att.organization || null,
          sector: att.sector || null,
          badgeRole: att.badgeRole || null,
          passwordHash: bcrypt.hashSync(att.password || 'default', 10),
        }
      });
      console.log(`Inserted: ${att.email}`);
    } catch (e: any) {
      console.log(`Skipped (or error): ${att.email} - ${e.message}`);
    }
  }
  console.log('Done!');
}

seed().catch(console.error);
