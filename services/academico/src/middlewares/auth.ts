const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config');

// Verificación de JWT 100% local: NO se llama a identity en cada request.
// Solo se valida la firma con el secreto compartido (mismo que emite identity).
function auth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'Token no proporcionado' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token inválido' });

  try {
    req.user = jwt.verify(token, jwtSecret);
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Token no válido o expirado' });
  }
}

function onlyAdmin(req, res, next) {
  if (req.user?.rol !== 3) {
    return res.status(403).json({ message: 'Acceso solo para administradores' });
  }
  next();
}

module.exports = { auth, onlyAdmin };