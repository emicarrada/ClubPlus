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

// Utilidad para calcular el precio final de un combo
const MARGEN = 1.55;

async function calcularPrecioFinal(platformIds: string[]): Promise<number> {
  const platforms = await prisma.platform.findMany({ where: { id: { in: platformIds } } });
  const suma = platforms.reduce((acc, p) => acc + p.pricePerProfile, 0);
  return Math.round(suma * MARGEN);
}

// Crear combo personalizado
app.post('/api/combo', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { platformIds } = req.body;
  if (!Array.isArray(platformIds) || platformIds.length < 2 || platformIds.length > 5) {
    return res.status(400).json({ error: 'Debes seleccionar entre 2 y 5 plataformas.' });
  }
  if (new Set(platformIds).size !== platformIds.length) {
    return res.status(400).json({ error: 'No puedes repetir plataformas.' });
  }
  try {
    // Verifica que el usuario no tenga un combo activo
    const existing = await prisma.combo.findFirst({ where: { userId: req.user.id, status: 'ACTIVE' } });
    if (existing) {
      return res.status(409).json({ error: 'Ya tienes un combo activo. Modifícalo en su lugar.' });
    }
    // Calcula el precio final
    const priceFinal = await calcularPrecioFinal(platformIds);
    // Crea el combo y las relaciones
    const combo = await prisma.combo.create({
      data: {
        userId: req.user.id,
        priceFinal,
        comboPlatforms: {
          create: platformIds.map(pid => ({ platformId: pid }))
        }
      },
      include: {
        comboPlatforms: { include: { platform: true } }
      }
    });
    res.status(201).json({
      id: combo.id,
      userId: combo.userId,
      platforms: combo.comboPlatforms.map(cp => ({
        id: cp.platform.id,
        name: cp.platform.name,
        pricePerProfile: cp.platform.pricePerProfile
      })),
      priceFinal: combo.priceFinal,
      status: combo.status,
      createdAt: combo.createdAt
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear combo', details: err });
  }
});

// Ver combo activo
app.get('/api/combo', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const combo = await prisma.combo.findFirst({
      where: { userId: req.user.id, status: 'ACTIVE' },
      include: { comboPlatforms: { include: { platform: true } } }
    });
    if (!combo) return res.status(404).json({ error: 'No tienes combo activo.' });
    res.json({
      id: combo.id,
      userId: combo.userId,
      platforms: combo.comboPlatforms.map(cp => ({
        id: cp.platform.id,
        name: cp.platform.name,
        pricePerProfile: cp.platform.pricePerProfile
      })),
      priceFinal: combo.priceFinal,
      status: combo.status,
      createdAt: combo.createdAt
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener combo', details: err });
  }
});

// Modificar combo activo
app.put('/api/combo', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { platformIds } = req.body;
  if (!Array.isArray(platformIds) || platformIds.length < 2 || platformIds.length > 5) {
    return res.status(400).json({ error: 'Debes seleccionar entre 2 y 5 plataformas.' });
  }
  if (new Set(platformIds).size !== platformIds.length) {
    return res.status(400).json({ error: 'No puedes repetir plataformas.' });
  }
  try {
    const combo = await prisma.combo.findFirst({ where: { userId: req.user.id, status: 'ACTIVE' }, include: { comboPlatforms: true } });
    if (!combo) return res.status(404).json({ error: 'No tienes combo activo.' });
    // Actualiza plataformas y precio
    const priceFinal = await calcularPrecioFinal(platformIds);
    // Borra relaciones previas
    await prisma.comboPlatform.deleteMany({ where: { comboId: combo.id } });
    // Crea nuevas relaciones
    await prisma.comboPlatform.createMany({ data: platformIds.map(pid => ({ comboId: combo.id, platformId: pid })) });
    // Actualiza el combo
    const updated = await prisma.combo.update({
      where: { id: combo.id },
      data: { priceFinal },
      include: { comboPlatforms: { include: { platform: true } } }
    });
    res.json({
      id: updated.id,
      userId: updated.userId,
      platforms: updated.comboPlatforms.map(cp => ({
        id: cp.platform.id,
        name: cp.platform.name,
        pricePerProfile: cp.platform.pricePerProfile
      })),
      priceFinal: updated.priceFinal,
      status: updated.status,
      createdAt: updated.createdAt
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al modificar combo', details: err });
  }
});

// Aquí irán los endpoints del MVP (usuarios, combos, pagos, etc.)

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Club+ backend corriendo en puerto ${PORT}`);
});
