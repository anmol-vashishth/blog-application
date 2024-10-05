const JWT = require("jsonwebtoken");
const secretkey = "c56rd65s6g%789j&*";

const auth = (req, res, next) => {
  //Find authorisation key from req headers

  const token = req.headers["authorization"];

  //If no key found, throw error
  if (!token)
    return res
      .status(401)
      .json({ message: "You are not authorized to access this route" });

  //If key is found, call JWT verify method
  try {
    const payload = JWT.verify(token, secretkey);
    req.user = payload;
  } catch (error) {
    return res
      .status(401)
      .json({ messsage: "You are not authorized to access this route" });
  }
  next();
};

module.exports = auth;
