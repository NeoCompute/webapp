module.exports = (req, res, next) => {
  const hasPayload =
    (req.headers["content-length"] &&
      parseInt(req.headers["content-length"], 10) > 0) ||
    (req.headers["transfer-encoding"] &&
      req.headers["transfer-encoding"] !== "identity") ||
    Object.keys(req.body).length > 0;

  if (hasPayload) {
    return res.status(400).send(); // Check if the error message is allowed with the TA
  }
  next();
}; // Checking req.body regardless of the presence of Conten-Length
