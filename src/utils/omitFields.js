const omitFields = (obj, fields) => {
  const newObj = { ...obj };
  fields.forEach((field) => {
    delete newObj[field];
  });
  return newObj;
};

module.exports = omitFields;
