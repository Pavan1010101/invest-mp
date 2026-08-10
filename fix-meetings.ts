import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const meetings = await prisma.meeting.findMany();
  
  for (const m of meetings) {
    let updateNeeded = false;
    let newRegId = m.registrationId;
    let newOfficerId = m.officerId;

    // Fix applicant ID (registrationId)
    if (newRegId && !newRegId.startsWith('IMP')) {
      const regByEmail = await prisma.registration.findUnique({ where: { email: newRegId } });
      
      let emailToLookup = regByEmail?.email;
      if (!emailToLookup && newRegId.length === 24) {
        const regByMongo = await prisma.user.findUnique({ where: { id: newRegId } });
        emailToLookup = regByMongo?.email;
      }
      
      if (emailToLookup) {
         const actualReg = await prisma.registration.findUnique({ where: { email: emailToLookup }});
         if (actualReg) {
           newRegId = actualReg.id;
           updateNeeded = true;
         }
      }
    }

    // Fix officer ID (if P2P)
    if (newOfficerId && !newOfficerId.startsWith('IMP') && newOfficerId.length > 0) {
      const regByEmail = await prisma.registration.findUnique({ where: { email: newOfficerId } });
      
      let emailToLookup = regByEmail?.email;
      if (!emailToLookup && newOfficerId.length === 24) {
        const regByMongo = await prisma.user.findUnique({ where: { id: newOfficerId } });
        emailToLookup = regByMongo?.email;
      }
      
      if (emailToLookup) {
         const actualReg = await prisma.registration.findUnique({ where: { email: emailToLookup }});
         if (actualReg) {
           newOfficerId = actualReg.id;
           updateNeeded = true;
         }
      }
    }

    if (updateNeeded) {
      await prisma.meeting.update({
        where: { id: m.id },
        data: {
          registrationId: newRegId,
          officerId: newOfficerId
        }
      });
      console.log(`Updated meeting ${m.id} to use proper Registration IDs.`);
    }
  }
  console.log('Done fixing meetings.');
}

main().then(() => prisma.$disconnect()).catch(console.error);
