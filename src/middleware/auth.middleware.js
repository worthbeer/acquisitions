import logger from '#config/logger.js';
import { jwttoken } from '#utils/jwt.js';
import { cookies } from '#utils/cookies.js';

export const authenticate = (req, res, next) => {
    const token = cookies.get(req, 'token');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    try {
        req.user = jwttoken.verify(token);
        next();
    } catch (e) {
        logger.error('Auth middleware error', e);
        return res.status(401).json({ error: 'Unauthorized' });
    }
};
