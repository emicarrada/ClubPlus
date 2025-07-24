import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', date: new Date() });
});

// Endpoint para registrar usuario
app.post('/api/register', async (req: Request, res: Response) => {
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
app.post('/api/login', async (req: Request, res: Response) => {
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
app.get('/api/platforms', async (req: Request, res: Response) => {
  try {
    const platforms = await prisma.platform.findMany();
    res.json(platforms);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener plataformas', details: err });
  }
});

// Extiende el tipo Request para incluir user y body correctamente
interface AuthRequest extends Request {
  user?: any;
  body: any;
  headers: any;
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


// Definición de combos fijos para el MVP
const COMBOS = [
  {
    name: 'FULL STREAM',
    platforms: [
      { name: 'Netflix Premium' },
      { name: 'Disney+' },
      { name: 'Max (HBO)' },
      { name: 'Amazon Prime Video' }
    ]
  },
  {
    name: 'OUT OF THE BOX',
    platforms: [
      { name: 'Canva Pro' },
      { name: 'Spotify Premium Familiar' },
      { name: 'YouTube Premium Familiar' }
    ]
  },
  {
    name: 'ALL IN',
    platforms: [
      { name: 'Netflix' },
      { name: 'Max' },
      { name: 'Disney+' },
      { name: 'Amazon Prime Video' },
      { name: 'Spotify Premium Familiar' },
      { name: 'Canva Pro' }
    ]
  }
];

function getComboByName(name: string) {
  return COMBOS.find(c => c.name === name);
}

// Crear combo fijo (solo MVP)
app.post('/api/combo', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { comboName } = req.body;
  const comboDef = getComboByName(comboName);
  if (!comboDef) {
    return res.status(400).json({ error: 'Combo no válido. Usa uno de los combos predefinidos.' });
  }
  try {
    // Verifica que el usuario no tenga un combo activo
    const existing = await prisma.combo.findFirst({ where: { userId: req.user.id, status: 'ACTIVE' } });
    if (existing) {
      return res.status(409).json({ error: 'Ya tienes un combo activo. Modifícalo en su lugar.' });
    }
    // Crea el combo (sin plataformas asociadas, solo nombre y usuario)
    const combo = await prisma.combo.create({
      data: {
        userId: req.user.id,
        priceFinal: 0, // Puedes ajustar el precio fijo si lo deseas
        status: 'ACTIVE'
      }
    });
    res.status(201).json({
      id: combo.id,
      userId: combo.userId,
      comboName: comboDef.name,
      platforms: comboDef.platforms,
      priceFinal: combo.priceFinal,
      status: combo.status,
      createdAt: combo.createdAt
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear combo', details: err });
  }
});

// Ver combo activo (solo MVP)
app.get('/api/combo', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const combo = await prisma.combo.findFirst({ where: { userId: req.user.id, status: 'ACTIVE' } });
    if (!combo) return res.status(404).json({ error: 'No tienes combo activo.' });
    // Buscar el nombre del combo en la respuesta (puedes guardar el nombre en el modelo si lo deseas)
    // Por ahora, solo retornamos el primero de los combos fijos
    // En producción, deberías guardar el nombre del combo en la base de datos
    res.json({
      id: combo.id,
      userId: combo.userId,
      comboName: 'COMBO MVP',
      platforms: [],
      priceFinal: combo.priceFinal,
      status: combo.status,
      createdAt: combo.createdAt
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener combo', details: err });
  }
});

// Modificar combo activo (solo MVP)
app.put('/api/combo', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { comboName } = req.body;
  const comboDef = getComboByName(comboName);
  if (!comboDef) {
    return res.status(400).json({ error: 'Combo no válido. Usa uno de los combos predefinidos.' });
  }
  try {
    const combo = await prisma.combo.findFirst({ where: { userId: req.user.id, status: 'ACTIVE' } });
    if (!combo) return res.status(404).json({ error: 'No tienes combo activo.' });
    // Actualiza el combo (puedes guardar el nombre si lo agregas al modelo)
    const updated = await prisma.combo.update({
      where: { id: combo.id },
      data: {},
    });
    res.json({
      id: updated.id,
      userId: updated.userId,
      comboName: comboDef.name,
      platforms: comboDef.platforms,
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
