import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'kapilkurchaniya98@gmail.com';
  const rawPassword = 'MPGIS-2511';
  
  // Find registration to get the ID and details
  const reg = await prisma.registration.findUnique({
    where: { email: email }
  });
  
  if (!reg) {
    console.log('Registration not found for email:', email);
    return;
  }
  
  console.log('Found registration:', reg.id);
  
  const existingUser = await prisma.user.findUnique({
    where: { email: email }
  });
  
  if (existingUser) {
    console.log('User already exists. Updating password...');
    await prisma.user.update({
      where: { email: email },
      data: {
        passwordHash: bcrypt.hashSync(rawPassword, 10)
      }
    });
    console.log('Password updated.');
  } else {
    console.log('Creating new user...');
    await prisma.user.create({
      data: {
        email: email,
        name: reg.applicantName,
        role: 'attendee',
        department: reg.organization,
        sector: reg.sectorId,
        badgeRole: reg.badgeRole,
        passwordHash: bcrypt.hashSync(rawPassword, 10),
      }
    });
    console.log('User created.');
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
