import React, { useState } from 'react';
import '../Styles/Modal.css'; // Asegurate de crear un archivo CSS para el modal

const AddParticipantModal = ({ isOpen, onClose, onAddParticipant, existingData }) => {
    const [cedula, setCedula] = useState('');
    const [nombre, setNombre] = useState('');
    const [rango, setRango] = useState('');
    const [estado, setEstado] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        // Verifica si el participante ya existe
        const exists = existingData.some(person => person.cedula === cedula);
        if (exists) {
            alert('El participante ya esta en la lista.');
            return;
        }

        onAddParticipant({ cedula, nombre, rango, estado });
        onClose(); // Cierra el modal despues de agregar el participante
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
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            required
                        />
                    </label>
                    <label>
                        Rango:
                        <input
                            type="text"
                            value={rango}
                            onChange={(e) => setRango(e.target.value)}
                            required
                        />
                    </label>
                    <label>
                        Estado:
                        <select
                            value={estado}
                            onChange={(e) => setEstado(e.target.value)}
                            required
                        >
                            <option value="">Seleccionar</option>
                            <option value="Asistio">Asistio</option>
                            <option value="No asistio">No asistio</option>
                        </select>
                    </label>
                    <button type="submit">Agregar</button>
                    <button type="button" onClick={onClose}>Cerrar</button>
                </form>
            </div>
        </div>
    );
};

export default AddParticipantModal;
