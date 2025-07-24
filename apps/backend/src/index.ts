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

// Endpoint para consultar planes disponibles
app.get('/api/plans', async (req: Request, res: Response) => {
  try {
    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      include: {
        platform: true
      }
    });
    res.json(plans);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener planes', details: err });
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

// Aquí irán los endpoints del MVP (usuarios, combos, pagos, etc.)

// Crear combo con plan específico (MVP simplificado)
app.post('/api/combo', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { planId } = req.body;
  if (!planId) {
    return res.status(400).json({ error: 'planId es requerido' });
  }
  try {
    // Verificar que el plan existe y está activo
    const plan = await prisma.plan.findFirst({ 
      where: { id: planId, isActive: true },
      include: { platform: true }
    });
    if (!plan) {
      return res.status(404).json({ error: 'Plan no encontrado o inactivo' });
    }

    // Verifica que el usuario no tenga un combo activo
    const existing = await prisma.combo.findFirst({ where: { userId: req.user.id, status: 'ACTIVE' } });
    if (existing) {
      return res.status(409).json({ error: 'Ya tienes un combo activo. Modifícalo en su lugar.' });
    }

    // Crea el combo con el plan seleccionado
    const combo = await prisma.combo.create({
      data: {
        userId: req.user.id,
        planId: plan.id,
        priceFinal: plan.price,
        status: 'ACTIVE'
      },
      include: {
        plan: {
          include: {
            platform: true
          }
        }
      }
    });

    res.status(201).json({
      id: combo.id,
      userId: combo.userId,
      plan: {
        id: combo.plan.id,
        name: combo.plan.name,
        description: combo.plan.description,
        price: combo.plan.price,
        platform: combo.plan.platform
      },
      priceFinal: combo.priceFinal,
      status: combo.status,
      createdAt: combo.createdAt
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear combo', details: err });
  }
});

// Ver combo activo (MVP simplificado)
app.get('/api/combo', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const combo = await prisma.combo.findFirst({ 
      where: { userId: req.user.id, status: 'ACTIVE' },
      include: {
        plan: {
          include: {
            platform: true
          }
        }
      }
    });
    if (!combo) return res.status(404).json({ error: 'No tienes combo activo.' });
    
    res.json({
      id: combo.id,
      userId: combo.userId,
      plan: {
        id: combo.plan.id,
        name: combo.plan.name,
        description: combo.plan.description,
        price: combo.plan.price,
        platform: combo.plan.platform
      },
      priceFinal: combo.priceFinal,
      status: combo.status,
      createdAt: combo.createdAt
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener combo', details: err });
  }
});

// Modificar combo activo (MVP simplificado)
app.put('/api/combo', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { planId } = req.body;
  if (!planId) {
    return res.status(400).json({ error: 'planId es requerido' });
  }
  try {
    // Verificar que el plan existe y está activo
    const plan = await prisma.plan.findFirst({ 
      where: { id: planId, isActive: true },
      include: { platform: true }
    });
    if (!plan) {
      return res.status(404).json({ error: 'Plan no encontrado o inactivo' });
    }

    const combo = await prisma.combo.findFirst({ where: { userId: req.user.id, status: 'ACTIVE' } });
    if (!combo) return res.status(404).json({ error: 'No tienes combo activo.' });
    
    // Actualiza el combo con el nuevo plan
    const updated = await prisma.combo.update({
      where: { id: combo.id },
      data: {
        planId: plan.id,
        priceFinal: plan.price
      },
      include: {
        plan: {
          include: {
            platform: true
          }
        }
      }
    });
    
    res.json({
      id: updated.id,
      userId: updated.userId,
      plan: {
        id: updated.plan.id,
        name: updated.plan.name,
        description: updated.plan.description,
        price: updated.plan.price,
        platform: updated.plan.platform
      },
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
