module.exports = (req, res, next) => {
  if (req.headers["content-type"] !== "application/json") {
    return res.status(415).json({
      error: "Unsupported Media Type. Content-Type must be application/json",
    });
  }

  next();
};
