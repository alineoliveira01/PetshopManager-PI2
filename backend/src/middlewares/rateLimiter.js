export function rateLimiter(options = {}) {
  const { windowMs = 15 * 60 * 1000, max = 100 } = options
  const hits = new Map()

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress
    const now = Date.now()

    if (!hits.has(ip)) {
      hits.set(ip, { count: 1, resetTime: now + windowMs })
      return next()
    }

    const record = hits.get(ip)

    if (now > record.resetTime) {
      record.count = 1
      record.resetTime = now + windowMs
      return next()
    }

    record.count += 1

    if (record.count > max) {
      return res.status(429).json({
        success: false,
        error: {
          code: 'TOO_MANY_REQUESTS',
          message: 'Muitas requisições, tente novamente mais tarde.'
        }
      })
    }

    next()
  }
}