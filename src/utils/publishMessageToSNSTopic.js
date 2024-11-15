const AWS = require("aws-sdk");
const sns = new AWS.SNS();

const publishMessageToSNSTopic = async (topicArn, message) => {
  try {
    const params = {
      Message: JSON.stringify(message),
      TopicArn: topicArn,
    };

    const response = await sns.publish(params).promise();
    logger.info("Message published successfully:", response.MessageId);
  } catch (error) {
    logger.error("Error publishing message to SNS:", error.message);
    throw new Error("Failed to publish message to SNS");
  }
};

module.exports = publishMessageToSNSTopic;