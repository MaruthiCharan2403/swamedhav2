const jwt = require('jsonwebtoken');
const User = require('../models/Userschema');

module.exports = async (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).send('Access Denied');

  try {
    const verified = jwt.verify(token,"8328211811");
    req.user = await User.findById(verified.id);
    next();
  } catch (err) {
    res.status(400).send('Invalid Token');
  }
};
