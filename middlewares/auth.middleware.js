const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_super_segura';

module.exports = function auth(req, res, next) {
  const authHeader = req.headers['authorization'];

  // Debe venir como: Authorization: Bearer TOKEN
  if (!authHeader) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token inválido' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Guardamos los datos del token en el request
    req.user = decoded; 
    /*
      req.user = {
        id_usuario,
        email,
        iat,
        exp
      }
    */

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token no válido o expirado' });
  }
};
