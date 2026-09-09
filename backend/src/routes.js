import { Router } from 'express'
import customerRoutes from './modules/customers/customer.routes.js'
import petRoutes from './modules/pets/pet.routes.js'
import categoryRoutes from './modules/categories/category.routes.js'
import productRoutes from './modules/products/product.routes.js'
import serviceRoutes from './modules/services/service.routes.js'
import employeeRoutes from './modules/employees/employee.routes.js'
import appointmentRoutes from './modules/appointments/appointment.routes.js'
import saleRoutes from './modules/sales/sale.routes.js'
import dashboardRoutes from './modules/dashboard/dashboard.routes.js'
import reportRoutes from './modules/reports/report.routes.js'
import stockRoutes from './modules/stock/stock.routes.js'
import priceHistoryRoutes from './modules/price-history/priceHistory.routes.js'

const apiRouter = Router()

apiRouter.use('/customers', customerRoutes)
apiRouter.use('/pets', petRoutes)
apiRouter.use('/categories', categoryRoutes)
apiRouter.use('/products', productRoutes)
apiRouter.use('/services', serviceRoutes)
apiRouter.use('/employees', employeeRoutes)
apiRouter.use('/appointments', appointmentRoutes)
apiRouter.use('/sales', saleRoutes)
apiRouter.use('/dashboard', dashboardRoutes)
apiRouter.use('/reports', reportRoutes)
apiRouter.use('/stock', stockRoutes)
apiRouter.use('/price-history', priceHistoryRoutes)

export default apiRouter