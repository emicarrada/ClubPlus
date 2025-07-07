import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', date: new Date() });
});

// Endpoint para registrar usuario
app.post('/api/register', async (req, res) => {
  const { email, password, name, phone } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }
  try {
    // Validar si el usuario ya existe
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }
    // Hash de la contraseña
    const bcrypt = await import('bcryptjs');
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, passwordHash, name, phone }
    });
    res.status(201).json({ id: user.id, email: user.email, name: user.name, phone: user.phone });
  } catch (err) {
    res.status(500).json({ error: 'Error al registrar usuario', details: err });
  }
});

// Endpoint para login de usuario
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    const bcrypt = await import('bcryptjs');
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    // Generar JWT
    const jwt = await import('jsonwebtoken');
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET || 'clubplusdev',
      { expiresIn: '7d' }
    );
    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, phone: user.phone }
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al iniciar sesión', details: err });
  }
});

// Endpoint para consultar plataformas disponibles
app.get('/api/platforms', async (req, res) => {
  try {
    const platforms = await prisma.platform.findMany();
    res.json(platforms);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener plataformas', details: err });
  }
});

// Extiende el tipo Request para incluir user
interface AuthRequest extends Request {
  user?: any;
}

// Middleware para verificar JWT tipado
function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token requerido' });
  const jwt = require('jsonwebtoken');
  jwt.verify(token, process.env.JWT_SECRET || 'clubplusdev', (err: any, user: any) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user;
    next();
  });
}

// Ejemplo de endpoint protegido
app.get('/api/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ id: user.id, email: user.email, name: user.name, phone: user.phone });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener usuario', details: err });
  }
});

// Aquí irán los endpoints del MVP (usuarios, combos, pagos, etc.)

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Club+ backend corriendo en puerto ${PORT}`);
});
