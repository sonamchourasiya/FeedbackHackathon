// Error-handling middleware
export const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500
    res.status(statusCode).json({
      message: err.message,
      // Include stack trace only in development
      stack: process.env.NODE_ENV === 'production' ? null : err.stack
    })
  }
  