import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import '../Styles/EventDetail.css';
import AddParticipantModal from './AddParticipantModal'; // Import the modal

// Register chart.js components
ChartJS.register(Title, Tooltip, Legend, ArcElement);

function EventDetail() {
    const { eventId } = useParams();
    const [event, setEvent] = useState(null);
    const [excelData, setExcelData] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchEventDetails();
    }, [eventId]);

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
    };

    const handleAddParticipant = (newParticipant) => {
        setExcelData([...excelData, newParticipant]);
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

            alert('Datos cargados correctamente.');
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

                    // Preserve new participants
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

    const attended = excelData.filter(person => person.estado === 'Asistio').length;
    const notAttended = excelData.length - attended;

    const pieData = useMemo(() => ({
        labels: ['Asistieron', 'No asistieron'],
        datasets: [
            {
                data: [attended, notAttended],
                backgroundColor: ['#36A2EB', '#FF6384'],
                hoverBackgroundColor: ['#36A2EB', '#FF6384'],
            },
        ],
    }), [attended, notAttended]);

    return (
        <div className="event-detail-container">
            {error && <p>{error}</p>}
            {event ? (
                <div>
                    <h1>{event.title}</h1>
                    <p>Ubicacion: {event.location}</p>
                    <p>Horario: {event.schedule}</p>
                    <p>Gerente: {event.manager}</p>
                    <p>Descripcion: {event.description}</p>
                    <p>Fecha de Registro: {new Date(event.dateRegistered).toLocaleString()}</p>

                    <input
                        type="text"
                        placeholder="Buscar por cedula o nombre"
                        value={searchQuery}
                        onChange={handleSearch}
                    />

                    <table>
                        <thead>
                            <tr>
                                <th>Cedula</th>
                                <th>Nombre</th>
                                <th>Rango</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((person, index) => (
                                <tr key={index}>
                                    <td>{person.cedula || person.Cedula}</td>
                                    <td>{person.Nombre || person.nombre}</td>
                                    <td>{person.rango  || person.Rango}</td>
                                    <td>
                                        <select
                                            value={person.estado || ""}
                                            onChange={(e) => handleAttendanceChange(index, e.target.value)}
                                        >
                                            <option value="">No asistio</option>
                                            <option value="Asistio">Asistio</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="pie-chart-container">
                        <Pie data={pieData} />
                    </div>

                    <button onClick={handleDownload} className="download-button">
                        Descargar Excel Actualizado
                    </button>

                    <button onClick={() => setIsModalOpen(true)} className="add-participant-button">
                        Agregar Participante
                    </button>

                    <button onClick={reloadData} className="reload-button">
                        Cargar Datos
                    </button>

                    <button onClick={pushDataToBackend} className="push-data-button">
                        Cargar Datos a la Base de Datos
                    </button>

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
