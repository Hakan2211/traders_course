// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function seed() {
  console.log('🌱 Seeding database...')
  console.time('Database seeded')

  // Get admin credentials from environment variables
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD
  const adminUsername = process.env.ADMIN_USERNAME || 'admin'
  const adminName = process.env.ADMIN_NAME || 'Admin'

  if (!adminEmail || !adminPassword) {
    console.log(
      '⚠️  ADMIN_EMAIL or ADMIN_PASSWORD not set, skipping admin user creation',
    )
    console.log('   Set these environment variables to create an admin user:')
    console.log('   - ADMIN_EMAIL')
    console.log('   - ADMIN_PASSWORD')
    console.log('   - ADMIN_USERNAME (optional, defaults to "admin")')
    console.log('   - ADMIN_NAME (optional, defaults to "Admin")')
  } else {
    // Hash the password with bcryptjs (same as auth-helpers.ts)
    const hashedPassword = await hash(adminPassword, 10)

    // Upsert admin user (create or update if exists)
    const admin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        // Update password in case it changed
        password: hashedPassword,
        role: 'ADMIN',
      },
      create: {
        email: adminEmail,
        username: adminUsername,
        password: hashedPassword,
        name: adminName,
        role: 'ADMIN',
      },
    })

    console.log(
      `✅ Admin user created/updated: ${admin.email} (role: ${admin.role})`,
    )
  }

  console.timeEnd('Database seeded')
}

seed()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
