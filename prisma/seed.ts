import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { hash } from 'bcryptjs'
import * as dotenv from 'dotenv'

dotenv.config()

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const password = await hash('demo1234', 12)

  await prisma.user.deleteMany()

  await prisma.user.createMany({
    data: [
      { email: 'manager1@example.com', passwordHash: password, role: 'MANAGER' },
      { email: 'manager2@example.com', passwordHash: password, role: 'MANAGER' },
      { email: 'employee1@example.com', passwordHash: password, role: 'EMPLOYEE' },
      { email: 'employee2@example.com', passwordHash: password, role: 'EMPLOYEE' },
      { email: 'employee3@example.com', passwordHash: password, role: 'EMPLOYEE' },
      { email: 'employee4@example.com', passwordHash: password, role: 'EMPLOYEE' },
    ],
  })

  console.log('Seeded 2 managers and 4 employees (password: demo1234)')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
