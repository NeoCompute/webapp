const db = require("../databases/postgresDbConnection");

const healthCheck = async (req, res) => {
  if (Object.keys(req.query).length > 0) {
    return res.status(400).end();
  }
  const isDbConnected = await db.testDbConnection();
  console.log("is DB Connected: ", isDbConnected);

  if (isDbConnected) {
    res.status(200).end();
  } else {
    res.status(503).end();
  }
  return res;
};

module.exports = { healthCheck };

// Checking workflow
