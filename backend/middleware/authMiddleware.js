// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

// This middleware properly verifies token and attaches user to req
export const protect = async (req, res, next) => {
    let token;
    
    // Check if token exists in headers
    if (req.headers.authorization) {
        try {
            // Get token from header (remove 'Bearer ' if present)
            token = req.headers.authorization.startsWith('Bearer') 
                ? req.headers.authorization.split(' ')[1]
                : req.headers.authorization;
            
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Get user from token and attach to request
            req.user = await userModel.findById(decoded.id).select('-password');
            
            if (!req.user) {
                return res.status(401).json({ msg: 'User not found' });
            }
            
            next();
        } catch (error) {
            console.log(error);
            return res.status(401).json({ msg: 'Not authorized, invalid token' });
        }
    } else {
        return res.status(401).json({ msg: 'Not authorized, no token' });
    }
};

// Remove or comment out the old authMiddleWare to avoid confusion
// export const authMiddleWare = ...