const logger = require("../utils/logger")("SchemaValidate");

const validate = async (schema, object) => {
  if (!schema) {
    logger.info("[validate] missing schema");
    return { error: "missing schema" };
  }

  if (!object) {
    logger.info("[validate] missing object");
    return { error: "missing object" };
  }

  try {
    logger.info("[validate] start validating object");
    const validatedObject = await schema.validate(object);
    logger.debug(validatedObject);
    logger.info("[validate] validating object successful");
    return { data: validatedObject };
  } catch (err) {
    if (err.name === "ValidationError") {
      logger.error(`[validate] Validation error: ${err.errors}`);
      return { error: err.errors };
    } else {
      logger.error(`[validate] Error: ${err}`);
    }
    return { error: "Unsupported error" };
  }
};

module.exports = validate;
