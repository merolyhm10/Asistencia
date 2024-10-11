import React, { useState } from 'react';
import '../Styles/Modal.css'; // Make sure your CSS file has styles for the toggle switch

const RANGO_OPTIONS = [
    "Almirante",
    "Vicealmirante",
    "Contralmirante",
    "Capitan de Navio",
    "Capitan de Fragata",
    "Capitan de Corbeta",
    "Teniente de Navio",
    "Teniente de Fragata",
    "Teniente de Corbeta",
    "Sargento Mayor",
    "Sargento",
    "Cabo",
    "MARINERO ESPECIALISTA",
    "MARINERO AUXILIAR",
    "ASIMILADO"
];

const AddParticipantModal = ({ isOpen, onClose, onAddParticipant, existingData }) => {
    const [cedula, setCedula] = useState('');
    const [Nombre, setNombre] = useState('');
    const [departamento, setDepartamento] = useState('');
    const [cargo, setCargo] = useState('');
    const [rango, setRango] = useState('');
    const [correo, setCorreo] = useState('');
    const [estado, setEstado] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();

        const exists = existingData.some(person => person.cedula === cedula);
        if (exists) {
            alert('El participante ya esta en la lista.');
            return;
        }

        onAddParticipant({ cedula, Nombre, departamento, cargo, rango, correo, estado: estado ? 'Asistio' : 'No asistio' });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Agregar Participante</h2>
                <form onSubmit={handleSubmit}>
                    <label>
                        Cedula:
                        <input
                            type="text"
                            value={cedula}
                            onChange={(e) => setCedula(e.target.value)}
                            required
                        />
                    </label>
                    <label>
                        Nombre:
                        <input
                            type="text"
                            value={Nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            required
                        />
                    </label>
                    <label>
                        Departamento:
                        <input
                            type="text"
                            value={departamento}
                            onChange={(e) => setDepartamento(e.target.value)}
                            required
                        />
                    </label>
                    <label>
                        Cargo:
                        <input
                            type="text"
                            value={cargo}
                            onChange={(e) => setCargo(e.target.value)}
                            required
                        />
                    </label>
                    <label>
                        Rango:
                        <select
                            value={rango}
                            onChange={(e) => setRango(e.target.value)}
                            required
                        >
                            <option value="">Seleccionar rango</option>
                            {RANGO_OPTIONS.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </label>
                    <label>
                        Correo:
                        <input
                            type="email"
                            value={correo}
                            onChange={(e) => setCorreo(e.target.value)}
                            required
                        />
                    </label>
                    <label className="toggle-label">
                        Estado:
                        <div className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={estado}
                                onChange={() => setEstado(!estado)}
                            />
                            <span className="slider"></span>
                        </div>
                        <span>{estado ? 'Asistio' : 'No asistio'}</span>
                    </label>
                    <button type="submit">Agregar</button>
                    <button type="button" onClick={onClose}>Cerrar</button>
                </form>
            </div>
        </div>
    );
};

export default AddParticipantModal;
