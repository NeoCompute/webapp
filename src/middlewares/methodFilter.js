module.exports = (req, res, next) => {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET"); // Inform Client which HTTP methods are permitted
    return res.status(405).end(); // Method Not Allowed
  }
  next();
};
