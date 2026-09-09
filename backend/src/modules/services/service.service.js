import { ServiceRepository } from './service.repository.js'
import { AppError } from '../../errors/AppError.js'
import prisma from '../../database/prisma.js'

const serviceRepository = new ServiceRepository()

export class ServiceService {
  async createService(data) {
    return serviceRepository.create(data)
  }

  async listServices(pagination) {
    return serviceRepository.findAll({
      skip: pagination.skip,
      limit: pagination.limit
    })
  }

  async getServiceById(id) {
    const service = await serviceRepository.findById(id)
    if (!service) {
      throw new AppError('Serviço não encontrado', 404, 'SERVICE_NOT_FOUND')
    }
    return service
  }

  async updateService(id, data) {
    const service = await this.getServiceById(id)
    if (data.precoAtual && Number(data.precoAtual) !== Number(service.precoAtual)) {
      await prisma.productPriceHistory.create({
        data: {
          productId: id,
          price: data.precoAtual,
          previousPrice: service.precoAtual,
          reason: 'Atualização de preço de serviço'
        }
      }).catch(() => {})
    }
    return serviceRepository.update(id, data)
  }

  async deleteService(id) {
    await this.getServiceById(id)
    return serviceRepository.softDelete(id)
  }
}