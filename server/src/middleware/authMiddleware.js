import jwt from 'jsonwebtoken';
import Player from '../models/Player.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.player = await Player.findById(decoded.id).select('-password');

      if (!req.player) {
        return res.status(401).json({
          error: 'Nicht autorisiert, Benutzer nicht gefunden'
        });
      }

      return next();
    } catch (error) {
      console.error('Fehler bei der Token-Verifizierung:', error.message);
      return res.status(401).json({
        error: 'Nicht autorisiert, Token ungültig oder abgelaufen'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      error: 'Nicht autorisiert, kein Token übergeben'
    });
  }
};

export default { protect };
