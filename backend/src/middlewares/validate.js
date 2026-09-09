import { AppError } from '../errors/AppError.js'

export function validate(schema) {
  return (req, res, next) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      })
      next()
    } catch (error) {
      const messages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      throw new AppError(messages, 422, 'VALIDATION_ERROR')
    }
  }
}