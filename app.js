import express from 'express';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import exphbs from 'express-handlebars';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';
import Message from './models/Message.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketServer(server);
const port = process.env.PORT || 8000;

// Conexión a MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Error de conexión a MongoDB Atlas:'));
db.once('open', () => {
  console.log('Conectado a MongoDB Atlas');
});

// Configuración del motor de plantillas Handlebars
const handlebars = exphbs.create({ defaultLayout: 'main' });
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Ruta para manejar las solicitudes POST para agregar productos
app.post('/api/products', async (req, res) => {
    const newProduct = req.body;
    try {
        const addedProduct = await Product.create(newProduct);
        io.emit('productList', await Product.find());
        res.json(addedProduct);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Rutas para los productos
const productRouter = express.Router();

productRouter.get('/', async (req, res) => {
  const limit = req.query.limit;
  try {
    let products = await Product.find();

    if (limit) {
      products = products.slice(0, parseInt(limit));
    }

    res.json({ products });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

productRouter.get('/:pid', async (req, res) => {
  const productId = req.params.pid;
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ error: 'ID de producto no válido' });
  }
  
  try {
    const product = await Product.findById(productId);
    if (product) {
      res.json({ product });
    } else {
      res.status(404).json({ error: 'Producto no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

productRouter.delete('/:pid', async (req, res) => {
  const productId = req.params.pid;
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ error: 'ID de producto no válido' });
  }
  
  try {
    await Product.findByIdAndDelete(productId);
    io.emit('productList', await Product.find());
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use('/api/products', productRouter);

// Rutas para los mensajes
app.post('/api/messages', async (req, res) => {
    const { user, message } = req.body;
    try {
        const newMessage = await Message.create({ user, message });
        res.json(newMessage);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Implementación del chat en handlebars (chat.handlebars)
app.get('/chat', (req, res) => {
  res.render('chat');
});

io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado');

  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });

  // Lógica para el chat...
});

server.listen(port, () => {
  console.log(`Servidor Express escuchando en el puerto ${port}`);
});
