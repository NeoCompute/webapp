const AWS = require("aws-sdk");

AWS.config.update({ region: process.env.AWS_REGION });
const sns = new AWS.SNS();

const publishUserCreated = async (user) => {
  const message = {
    userId: user.id,
    email: user.email,
    verifyToken: user.verifyToken, // Token generated for verification
    timestamp: new Date().toISOString(),
  };

  const params = {
    Message: JSON.stringify(message),
    TopicArn: process.env.SNS_TOPIC_ARN, // Environment variable for SNS ARN
  };

  try {
    await sns.publish(params).promise();
    console.log("SNS message published successfully");
  } catch (error) {
    console.error("Error publishing to SNS", error);
  }
};

module.exports = {
  publishUserCreated,
};
