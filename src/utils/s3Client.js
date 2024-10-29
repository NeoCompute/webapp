const AWS = require("aws-sdk");
const statsd = require("./statsdClient");

// if (process.env.ENVIRONMENT === "local") {
//   const credentials = new AWS.SharedIniFileCredentials({
//     profile: process.env.AWS_PROFILE || "dev",
//   });
//   AWS.config.credentials = credentials;
// }

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

const uploadImage = async (fileContent, fileName, bucketName) => {
  const params = {
    Bucket: bucketName,
    Key: fileName,
    Body: fileContent,
    ContentType: "image/jpeg", // Adjust as needed based on the actual image format
  };
  return performS3Action("upload", params);
};

const deleteImage = async (fileName, bucketName) => {
  const params = {
    Bucket: bucketName,
    Key: fileName,
  };
  return performS3Action("deleteObject", params);
};

const getImageUrl = (bucketName, fileName) => {
  return `https://${bucketName}.s3.amazonaws.com/${fileName}`;
};

module.exports = { uploadImage, deleteImage, getImageUrl };
