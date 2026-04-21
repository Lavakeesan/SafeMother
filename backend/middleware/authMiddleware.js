const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const protect = async (req, res, next) => {
    let token;

    token = req.cookies.jwt;

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'defaultsecret');

            req.user = await User.findById(decoded.id).select('-password');

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized: Token is invalid or expired (' + error.message + ')' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized: No login token found in cookies' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ message: "Not authorized (No role assigned)" });
        }
        
        const userRole = req.user.role.toLowerCase();
        const allowedRoles = roles.map(r => r.toLowerCase());

        if (!allowedRoles.includes(userRole)) {
            console.error(`403 Forbidden: User ${req.user.email} has role '${req.user.role}' but route requires ${roles.join('/')}`);
            return res.status(403).json({ message: `Not authorized. You are logged in as a ${req.user.role}, but this action requires ${roles.join(' or ')} access.` });
        }
        next();
    };
};

module.exports = { protect, authorize };
