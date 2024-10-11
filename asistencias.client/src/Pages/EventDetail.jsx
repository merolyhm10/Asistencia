import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import '../Styles/EventDetail.css';
import AddParticipantModal from './AddParticipantModal'; // Import the modal
import logoArmada from '../assets/logo-armada.png';
import { useNavigate } from 'react-router-dom';

// Register chart.js components
ChartJS.register(Title, Tooltip, Legend, ArcElement);

function EventDetail() {
    const { eventId } = useParams();
    const [event, setEvent] = useState(null);
    const [excelData, setExcelData] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [dataChanged, setDataChanged] = useState(false); // New state to track changes
    const navigate = useNavigate();

    useEffect(() => {
        fetchEventDetails();

        // Set up interval for pushing data to backend every 5 seconds
        const intervalId = setInterval(() => {
            if (dataChanged) { // Only push if data has changed
                pushDataToBackend();
            }
        }, 10);

        // Clear interval on component unmount
        return () => clearInterval(intervalId);
    }, [eventId, dataChanged]); // Depend on dataChanged to control when to push

    const fetchEventDetails = async () => {
        if (eventId) {
            try {
                const response = await axios.get(`https://localhost:7185/api/event/${eventId}`);
                if (response.data.exito) {
                    setEvent(response.data.resultado);

                    if (response.data.resultado.excelFile) {
                        const workbook = XLSX.read(atob(response.data.resultado.excelFile), { type: 'binary' });
                        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                        const data = XLSX.utils.sheet_to_json(worksheet);
                        setExcelData(data);
                    } else {
                        setExcelData([]);
                    }

                    setError(null);
                } else {
                    setError('Error en la respuesta de la API');
                }
            } catch (error) {
                console.error('Error al obtener los detalles del evento:', error);
                setError('Error al obtener los detalles del evento');
            }
        } else {
            setError('ID de evento no proporcionado');
        }
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const filteredData = excelData.filter(person =>
        person.cedula?.toString().includes(searchQuery) || person.nombre?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAttendanceChange = (index, value) => {
        const updatedData = [...excelData];
        updatedData[index].estado = value;
        setExcelData(updatedData);
        setDataChanged(true); // Mark data as changed
    };

    const handleAddParticipant = async (newParticipant) => {
        const updatedExcelData = [...excelData, newParticipant];
        setExcelData(updatedExcelData);
        setDataChanged(true); // Mark data as changed

        try {
            const ws = XLSX.utils.json_to_sheet(updatedExcelData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
            const fileData = XLSX.write(wb, { type: 'base64' });

            await axios.post(`https://localhost:7185/api/event/${eventId}/update`, {
                excelFile: fileData
            });

            alert('Participante agregado y datos cargados correctamente.');
        } catch (error) {
            console.error('Error al cargar los datos:', error);
            setError('Error al cargar los datos');
        }
    };

    const handleDownload = () => {
        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        XLSX.writeFile(wb, 'UpdatedData.xlsx');
    };

    const pushDataToBackend = async () => {
        try {
            const ws = XLSX.utils.json_to_sheet(excelData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
            const fileData = XLSX.write(wb, { type: 'base64' });

            await axios.post(`https://localhost:7185/api/event/${eventId}/update`, {
                excelFile: fileData
            });

            console.log('Datos cargados correctamente a la base de datos.');
            setDataChanged(false); // Reset change tracker after pushing
        } catch (error) {
            console.error('Error al cargar los datos:', error);
            setError('Error al cargar los datos');
        }
    };

    const reloadData = async () => {
        try {
            const response = await axios.get(`https://localhost:7185/api/event/${eventId}`);
            if (response.data.exito) {
                if (response.data.resultado.excelFile) {
                    const workbook = XLSX.read(atob(response.data.resultado.excelFile), { type: 'binary' });
                    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                    const newExcelData = XLSX.utils.sheet_to_json(worksheet);

                    const updatedData = newExcelData.map(row => {
                        const existingParticipant = excelData.find(p => p.cedula === row.cedula);
                        return existingParticipant ? { ...existingParticipant, ...row } : row;
                    });

                    setExcelData(updatedData);
                } else {
                    setExcelData([]);
                }

                setError(null);
            } else {
                setError('Error en la respuesta de la API');
            }
        } catch (error) {
            console.error('Error al cargar los datos:', error);
            setError('Error al cargar los datos');
        }
    };

    return (
        <div className="event-detail-container">
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
            {error && <p>{error}</p>}
            {event ? (
                <div>
                    <h1>{event.title}</h1>
                    <p>{event.location}</p>
                    <p>{event.schedule}</p>
                    <p>Fecha de Registro: {new Date(event.dateRegistered).toLocaleString()}</p>

                    <input
                        type="text"
                        placeholder="Buscar por cedula"
                        value={searchQuery}
                        onChange={handleSearch}
                    />

                    <table>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Cedula</th>
                                <th>Departamento</th>
                                <th>Cargo</th>
                                <th>Rango</th>
                                <th>Correo Electronico</th>
                                <th>Estado</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredData.map((person, index) => (
                                <tr key={index}>
                                    <td>{person.Nombre || person.nombre}</td>
                                    <td>{person.Cedula || person.cedula}</td>
                                    <td>{person.Departamento || person.departamento}</td>
                                    <td>{person.Cargo || person.cargo}</td>
                                    <td>{person.Rango || person.rango}</td>
                                    <td>{person.Correo || person.correo}</td>
                                    <td>
                                        <label className="switch">
                                            <input
                                                type="checkbox"
                                                checked={person.estado === "Asistio"}
                                                onChange={() => handleAttendanceChange(index, person.estado === "Asistio" ? "" : "Asistio")}
                                            />
                                            <span className="slider round"></span>
                                        </label>
                                        <span>{person.estado === "Asistio" ? "Asistio" : "No asistio"}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <button onClick={handleDownload} className="download-button">
                        Descargar Excel Actualizado
                    </button>{//Descargar el excel con todos los participantes
                    }

                    <button onClick={() => setIsModalOpen(true)} className="add-participant-button">
                        Agregar Participante
                        Agregar Participante
                    </button> {//añadir un nuevo participante
                    }

                    <button onClick={reloadData} className="reload-button">
                        Cargar Datos
                    </button> {// Esto funciona en caso de emergencia que el excel se dañe recuperar el de la base de datos
                    }

                    <button onClick={() => navigate(`/Dashboard/${eventId}`)} className="dashboard-button">
                        Dashboard
                    </button>{// cargar el dashboard con todos los datos
                    }

                    <AddParticipantModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onAddParticipant={handleAddParticipant}
                        existingData={excelData}
                    />

                </div>
            ) : (
                <p>Cargando detalles del evento...</p>
            )}
        </div>
    );
}

export default EventDetail;
