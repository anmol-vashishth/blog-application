const logger = (req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl}`);
  req.requestTime = Date.now();
  next();
};

module.exports = logger;
