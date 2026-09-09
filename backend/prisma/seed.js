import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const customer = await prisma.customer.create({
    data: {
      nomeCompleto: 'João da Silva',
      cpf: '12345678901',
      telefone: '11999999999',
      email: 'joao@email.com',
      endereco: 'Rua das Flores',
      numero: '123',
      bairro: 'Centro',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01001000'
    }
  })

  const pet = await prisma.pet.create({
    data: {
      customerId: customer.id,
      nome: 'Rex',
      especie: 'Cachorro',
      raca: 'Golden Retriever',
      sexo: 'Macho',
      pesoAtual: 30.5,
      tamanho: 'GRANDE',
      tamanhoDoPelo: 'LONGO',
      idade: 4,
      tranquilidade: 'MODERADO'
    }
  })

  const category = await prisma.category.create({
    data: {
      nome: 'Rações'
    }
  })

  const product = await prisma.product.create({
    data: {
      categoryId: category.id,
      nome: 'Ração Super Premium 15kg',
      SKU: 'RAC-SUP-15',
      precoAtual: 250.00,
      estoqueAtual: 50,
      estoqueMinimo: 10
    }
  })

  await prisma.stockMovement.create({
    data: {
      productId: product.id,
      tipo: 'ENTRADA',
      quantidade: 50,
      estoqueAnterior: 0,
      estoquePosterior: 50,
      motivo: 'Estoque inicial via Seed'
    }
  })

  const service = await prisma.service.create({
    data: {
      nome: 'Banho e Tosa Completo',
      precoAtual: 120.00,
      duracaoEmMinutos: 90
    }
  })

  const employee = await prisma.employee.create({
    data: {
      nome: 'Maria Souza',
      telefone: '11988888888',
      email: 'maria@petshop.com',
      cargo: 'Tosadora'
    }
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })