import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/schemas/user.schema';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@eventflow.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const adminName = process.env.ADMIN_NAME || 'Admin User';

  const existing = await usersService.findByEmail(adminEmail);
  if (existing) {
    console.log(`Admin already exists: ${adminEmail}`);
  } else {
    await usersService.create({
      fullName: adminName,
      email: adminEmail,
      password: adminPassword,
      role: UserRole.ADMIN,
    });
    console.log(`Admin created: ${adminEmail}`);
  }

  await app.close();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
