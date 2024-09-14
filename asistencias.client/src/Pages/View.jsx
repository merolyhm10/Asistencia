import { useState, useEffect } from 'react';
import axios from 'axios';
import '../Styles/View.css';
import logoArmada from '../assets/logo-armada.png';
import { BsFillMoonStarsFill } from "react-icons/bs";
import { FaSun } from "react-icons/fa";
import { Link } from 'react-router-dom';

function View() {
    const [darkMode, setDarkMode] = useState(false);
    const [isNight, setIsNight] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        document.body.style.backgroundColor = darkMode ? '#333' : '#f0f0f0';
    }, [darkMode]);

    useEffect(() => {
        const hour = new Date().getHours();
        setIsNight(hour >= 19 || hour <= 6);
        setDarkMode(hour >= 19 || hour <= 6);
    }, []);

    useEffect(() => {
        fetchEvents();
    }, []);

    useEffect(() => {
        filterEvents();
    }, [searchQuery, events]);

    const toggleTheme = () => {
        setDarkMode(prevDarkMode => !prevDarkMode);
    };

    const fetchEvents = async () => {
        try {
            const response = await axios.get('https://localhost:7185/api/eventsRead');
            if (response.data.exito) {
                setEvents(response.data.resultado || []);
                setFilteredEvents(response.data.resultado || []);
                setError(null);
            } else {
                console.error('Error en la respuesta de la API:', response.data.mensaje);
                setError('Error en la respuesta de la API');
            }
        } catch (error) {
            console.error('Error al obtener los eventos:', error.response || error);
            setError('Error al obtener los eventos');
        }
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const filterEvents = () => {
        const lowercasedQuery = searchQuery.trim().toLowerCase();
        const filtered = events.filter(event =>
            (event.title?.toLowerCase().includes(lowercasedQuery) || '') ||
            (event.location?.toLowerCase().includes(lowercasedQuery) || '') ||
            (event.schedule?.toLowerCase().includes(lowercasedQuery) || '') ||
            (event.manager?.toLowerCase().includes(lowercasedQuery) || '') ||
            (event.description?.toLowerCase().includes(lowercasedQuery) || '')
        );
        setFilteredEvents(filtered);
    };

    return (
        <div>
            <header className="header">
                <div className="container">
                    <div className='logo'>
                        <img src={logoArmada} alt='Logo' />
                    </div>
                    <div className="title">
                        <h1>Armada de Republica Dominicana, ARD.</h1>
                    </div>
                    <nav className="nav">
                        <ul>
                            <li><Link to="/create-event">Crear Eventos</Link></li>
                        </ul>
                    </nav>
                </div>
            </header>

            <div className="adminContainer">
                <div className="themeToggleButton" onClick={toggleTheme} style={{ cursor: 'pointer' }}>
                    {darkMode ? 'Light Mode' : 'Dark Mode'}
                    {isNight ? <BsFillMoonStarsFill /> : <FaSun />}
                </div>

                <div className="searchContainer">
                    <input
                        type="text"
                        className="searchInput"
                        placeholder="Buscar eventos..."
                        value={searchQuery}
                        onChange={handleSearch}
                    />
                    <button onClick={filterEvents} className="searchButton">Buscar</button>
                </div>

                {error && <p className="error">{error}</p>}

                <div className="eventsContainer">
                    {filteredEvents.map((event) => (
                        <div key={event._id} className="eventItem">
                            <div className="eventInfo">
                                <h3>{event.title || 'Sin titulo'}</h3>
                                <p>{event.location || 'Sin ubicacion'}</p>
                                <p>{event.schedule || 'Sin horario'}</p>
                            </div>
                            <Link to={`/EventDetails/${event._id}`} className="detailsLink">Ver detalles</Link>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}

export default View;
