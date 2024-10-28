const AWS = require("aws-sdk");
const statsd = require("./statsdClient");

const s3 = new AWS.S3();

async function performS3Action(action, params) {
  const startTime = Date.now();

  try {
    const result = await s3[action](params).promise();
    const duration = Date.now() - startTime;
    statsd.timing(`s3.${action}.response_time`, duration);
    return result;
  } catch (error) {
    statsd.increment(`s3.${action}.error_count`);
    throw error;
  }
}

module.exports = { performS3Action };
