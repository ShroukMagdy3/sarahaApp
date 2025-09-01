export const handleError = (err, req, res, next) => {
 return res
    .status(err["case"] || 500)
    .json({ message: err.message, stack: err.stack });
};
