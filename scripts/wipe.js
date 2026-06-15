const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando Wipe Completo...');
  await prisma.expense.deleteMany();
  await prisma.closedCase.deleteMany();
  await prisma.evaluation.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();
  console.log('Wipe concluído com sucesso. Todos os dados foram apagados.');
}

main()
  .catch(e => {
    console.error('Erro durante o Wipe:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
