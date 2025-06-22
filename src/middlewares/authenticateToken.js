function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Token de acesso requerido",
    });
  }

  try {
    const secret = process.env.JWT_SECRET;
    const decoded = jwt.verify(token, secret);

    req.user = {
      id: decoded.id,
      firstname: decoded.firstname,
      surname: decoded.surname,
      email: decoded.email,
    };

    next();
  } catch (error) {
    return res.status(403).json({
      message: "Token inválido ou expirado",
    });
  }
}
