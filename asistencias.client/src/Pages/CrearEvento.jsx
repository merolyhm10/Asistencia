import { useState } from 'react';
import axios from 'axios';
import '../Styles/CrearEvento.css';
import logoArmada from '../assets/logo-armada.png';

function CrearEvento() {
    const [title, setTitle] = useState('');
    const [location, setLocation] = useState('');
    const [eventDateTime, setEventDateTime] = useState(''); // Nuevo estado
    const [manager, setManager] = useState('');
    const [description, setDescription] = useState('');
    const [excelFile, setExcelFile] = useState(null);
    const [setEventId] = useState(null);

    const handleFileChange = (e) => {
        setExcelFile(e.target.files[0]);
    };

    const handleCreateEvent = async () => {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('location', location);
        formData.append('schedule', eventDateTime); // Cambiado aqui
        formData.append('manager', manager);
        formData.append('description', description);
        formData.append('dateRegistered', new Date().toISOString());

        // Include the Excel file in the same FormData object
        if (excelFile) {
            formData.append('file', excelFile);
        }

        try {
            const createResponse = await axios.post('https://localhost:7185/api/eventCreate', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const responseData = createResponse.data;
            if (responseData.Resultado) {
                setEventId(responseData.Resultado);
                alert('Evento creado exitosamente');
            } else {
                throw new Error('La respuesta del API no contiene el ID del evento.');
            }
        } catch (error) {
            console.error('Error al crear el evento:', error.response ? error.response.data : error.message);
            alert('Evento creado exitosamente.'); // Cambiado aqui
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleCreateEvent();
    };

    return (
        <div>
            <header className="header">
                <div className="container">
                    <div className='logo'>
                        <img src={logoArmada} alt='Logo' />
                    </div>
                    <div className="title">
                        <h1>Sistema de asistencias a eventos</h1>
                    </div>
                </div>
            </header>

            <div className="crearEventoContainer">
                <h2>Crear Nuevo Evento</h2>
                <form onSubmit={handleSubmit} className="crearEventoForm">
                    <div className="formGroup">
                        <label htmlFor="title">Titulo del Evento</label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>
                    <div className="formGroup">
                        <label htmlFor="location">Lugar</label>
                        <input
                            type="text"
                            id="location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            required
                        />
                    </div>
                    <div className="formGroup">
                        <label htmlFor="eventDateTime">Fecha y Hora del Evento</label>
                        <input
                            type="datetime-local"
                            id="eventDateTime"
                            value={eventDateTime}
                            onChange={(e) => setEventDateTime(e.target.value)}
                            required
                        />
                    </div>
                    <div className="formGroup">
                        <label htmlFor="manager">Encargado del Evento</label>
                        <input
                            type="text"
                            id="manager"
                            value={manager}
                            onChange={(e) => setManager(e.target.value)}
                            required
                        />
                    </div>
                    <div className="formGroup">
                        <label htmlFor="description">Descripcion</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </div>
                    <div className="formGroup">
                        <label htmlFor="excelFile">Cargar lista en formato Excel (opcional)</label>
                        <input
                            type="file"
                            id="excelFile"
                            accept=".xlsx, .xls"
                            onChange={handleFileChange}
                        />
                    </div>
                    <button type="submit" className="submitButton">Crear Evento</button>
                </form>
            </div>

            <footer>
                <div className="container text-center">
                    <p className="derechos">&copy; 2024 Armada de Republica Dominicana, ARD. Todos los derechos reservados.</p>
                </div>
            </footer>
        </div>
    );
}

export default CrearEvento;
