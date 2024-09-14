import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import multer from 'multer';

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

// Conexion a MongoDB
mongoose.connect('mongodb://localhost:27017/marina', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Definir el esquema de eventos
const eventSchema = new mongoose.Schema({
    title: String,
    location: String,
    schedule: String,
    manager: String,
    description: String,
    dateRegistered: Date,
});

const Event = mongoose.model('Event', eventSchema);

// Ruta para obtener eventos
app.get('/events', async (req, res) => {
    try {
        const events = await Event.find();
        res.json(events);
    } catch (error) {
        console.error(error); // Loguear el error en la consola
        res.status(500).json({ message: 'Error al obtener los eventos.' });
    }
});

// Ruta para crear eventos
app.post('/events', upload.single('file'), async (req, res) => {
    try {
        const event = new Event({
            title: req.body.title,
            location: req.body.location,
            schedule: req.body.schedule,
            manager: req.body.manager,
            description: req.body.description,
            dateRegistered: req.body.dateRegistered,
        });
        await event.save();
        res.status(201).json(event);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear el evento.' });
    }
});

// Iniciar servidor
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
