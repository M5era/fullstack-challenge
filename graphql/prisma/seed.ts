import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {

  console.log(`Start seeding Transactions...`)
  const result_transactions: number =
      await prisma.$executeRaw`COPY "Transaction" FROM 'data/transactions_cleaned.csv' DELIMITER ',' CSV HEADER`
  const result_transactions2: number =
      await prisma.$executeRaw`ALTER TABLE "Transaction" RENAME COLUMN account TO bank2;`
  const result_transactions3: number =
      await prisma.$executeRaw`ALTER TABLE "Transaction" RENAME COLUMN bank TO account;`
  const result_transactions4: number =
      await prisma.$executeRaw`ALTER TABLE "Transaction" RENAME COLUMN bank2 TO bank;`

  console.log(`Start seeding Accounts...`)
  const result_account: number =
      await prisma.$executeRaw`COPY "Account" FROM 'data/accounts.csv' DELIMITER ',' CSV HEADER`

  console.log(`Start seeding Categories...`)
  const result_categories: number =
      await prisma.$executeRaw`COPY "Category" FROM 'data/categories.csv' DELIMITER ',' CSV HEADER`
    const result_categories2: number =
      await prisma.$executeRaw`ALTER TABLE "Category" RENAME COLUMN name TO color2;`
    const result_categories3: number =
      await prisma.$executeRaw`ALTER TABLE "Category" RENAME COLUMN color TO name;`
    const result_categories4: number =
      await prisma.$executeRaw`ALTER TABLE "Category" RENAME COLUMN color2 TO color;`


  console.log(`Seeding finished.`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
