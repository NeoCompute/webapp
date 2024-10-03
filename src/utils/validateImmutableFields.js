const { ValidateError } = require("../errors/customErrors");

const validateImmutableFields = (fields, immutableFields) => {
  const invalidFields = Object.keys(fields).filter((field) =>
    immutableFields.includes(field)
  );

  if (invalidFields.length > 0) {
    throw new ValidateError(
      `The following fields cannot be updated: ${invalidFields.join(", ")}`
    );
  }
};

module.exports = validateImmutableFields;
