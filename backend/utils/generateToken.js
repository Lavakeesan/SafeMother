const jwt = require('jsonwebtoken');

const generateToken = (res, userId) => {
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET || 'defaultsecret', {
        expiresIn: '30d',
    });

    res.cookie('jwt', token, {
        httpOnly: true,
        secure: true, // Must be true for sameSite: 'none'
        sameSite: 'none', // Required for cross-domain cookies
        maxAge: 30 * 24 * 60 * 60 * 1000,
    });
};

module.exports = generateToken;
