import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function deleteRecords() {
  try {
    const result = await prisma.user.deleteMany({
      where: {
        createdAt: {
          contains: '03-10'
        }
      }
    })
    console.log(`成功删除了 ${result.count} 条记录`)
  } catch (error) {
    console.error('删除记录时发生错误:', error)
  } finally {
    await prisma.$disconnect()
  }
}

deleteRecords() 