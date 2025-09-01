import Joi from "joi";

export const validation = (schema) => {
  return (req, res, next) => {
    let errors = [];
    for (const key of Object.keys(schema)) {
      const data = schema[key].validate(req[key], { abortEarly: false });
      if (data?.error) {
        errors.push(data.error.details);
      }
    }
    if (errors.length) {
      return res.status(400).json({ error: errors });
    }
    return next();
  };
};
