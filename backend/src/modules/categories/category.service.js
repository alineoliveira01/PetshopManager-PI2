import { CategoryRepository } from './category.repository.js'
import { AppError } from '../../errors/AppError.js'

const categoryRepository = new CategoryRepository()

export class CategoryService {
  async createCategory(data) {
    return categoryRepository.create(data)
  }

  async listCategories(pagination) {
    return categoryRepository.findAll({
      skip: pagination.skip,
      limit: pagination.limit
    })
  }

  async getCategoryById(id) {
    const category = await categoryRepository.findById(id)
    if (!category) {
      throw new AppError('Categoria não encontrada', 404, 'CATEGORY_NOT_FOUND')
    }
    return category
  }

  async updateCategory(id, data) {
    await this.getCategoryById(id)
    return categoryRepository.update(id, data)
  }

  async deleteCategory(id) {
    await this.getCategoryById(id)
    return categoryRepository.softDelete(id)
  }
}