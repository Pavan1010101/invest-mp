import { OfficerStore } from '../lib/server/db';
import { DEPARTMENT_OFFICER_CREDENTIALS, APPROVED_ATTENDEE_CREDENTIALS } from '../lib/auth/officerCredentials';

async function seed() {
  console.log('Seeding Department Officer Credentials...');
  for (const officer of DEPARTMENT_OFFICER_CREDENTIALS) {
    try {
      await OfficerStore.insert(officer);
      console.log(`Inserted: ${officer.email}`);
    } catch (e: any) {
      console.log(`Skipped (or error): ${officer.email} - ${e.message}`);
    }
  }
  
  console.log('\nSeeding Approved Attendee Credentials (as users)...');
  for (const att of APPROVED_ATTENDEE_CREDENTIALS) {
    try {
      await OfficerStore.insert({
        id: att.registrationId,
        name: att.name,
        email: att.email,
        password: att.password,
        role: 'attendee' as any,
        department: att.organization,
        sector: att.sector,
        badgeRole: att.badgeRole
      });
      console.log(`Inserted: ${att.email}`);
    } catch (e: any) {
      console.log(`Skipped (or error): ${att.email} - ${e.message}`);
    }
  }
  console.log('Done!');
}

seed().catch(console.error);
