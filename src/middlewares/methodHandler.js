module.exports = (allowedMethods) => (req, res, next) => {
  if (!allowedMethods.includes(req.method)) {
    res.setHeader("Allow", allowedMethods.join(", ")); // Inform Client which HTTP methods are permitted
    return res.status(405).end();
  }
  next();
};
