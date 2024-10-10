import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import logoArmada from '../assets/logo-armada.png';
import * as XLSX from 'xlsx';
import ChartDataLabels from 'chartjs-plugin-datalabels';

function Dashboard() {
    const { eventId } = useParams();
    const [eventData, setEventData] = useState(null);
    const [attended, setAttended] = useState(0);
    const [notAttended, setNotAttended] = useState(0);
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        const fetchEventData = async () => {
            try {
                const response = await axios.get(`https://localhost:7185/api/event/${eventId}`);
                if (response.data.exito) {
                    const { excelFile, schedule } = response.data.resultado;

                    // Process excelFile to get attendance data
                    const workbook = XLSX.read(atob(excelFile), { type: 'binary' });
                    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                    const data = XLSX.utils.sheet_to_json(worksheet);
                    const attendedCount = data.filter(person => person.estado === 'Asistio').length;
                    const notAttendedCount = data.length - attendedCount;

                    setAttended(attendedCount);
                    setNotAttended(notAttendedCount);

                    // Calculate the initial countdown once based on the schedule
                    const eventDate = new Date(schedule);
                    const now = new Date();
                    setCountdown(eventDate - now); // Difference in milliseconds
                }
            } catch (error) {
                console.error('Error fetching event data:', error);
            }
        };

        fetchEventData();

        // Set up interval to refresh data every 10 seconds (or as desired)
        const interval = setInterval(() => {
            fetchEventData();
        }, 10000); // Fetch data every 10 seconds (adjust as needed)

        return () => clearInterval(interval); // Cleanup the interval on unmount
    }, [eventId]);

    // Handle the countdown independently of data fetching
    useEffect(() => {
        const countdownInterval = setInterval(() => {
            setCountdown(prev => prev - 1000); // Decrease countdown by 1 second (1000 milliseconds)
        }, 1000); // Update every second

        return () => clearInterval(countdownInterval); // Cleanup on unmount
    }, []);

    const pieData = {
        labels: ['Asistieron', 'No asistieron'],
        datasets: [
            {
                data: [attended, notAttended],
                backgroundColor: ['#36A2EB', '#FF6384'],
            },
        ],
    };

    const formatTime = (time) => {
        if (time <= 0) {
            return { message: "Evento comenzo", days: 0, hours: 0, minutes: 0, seconds: 0 };
        }

        const seconds = Math.floor((time / 1000) % 60);
        const minutes = Math.floor((time / 1000 / 60) % 60);
        const hours = Math.floor((time / (1000 * 60 * 60)) % 24);
        const days = Math.floor(time / (1000 * 60 * 60 * 24));

        return { days, hours, minutes, seconds };
    };

    const { message, days, hours, minutes, seconds } = formatTime(countdown);

    const totalParticipants = attended + notAttended;
    const attendedPercentage = totalParticipants > 0 ? ((attended / totalParticipants) * 100).toFixed(2) : 0;
    const notAttendedPercentage = totalParticipants > 0 ? ((notAttended / totalParticipants) * 100).toFixed(2) : 0;

    const options = {
        plugins: {
            legend: {
                display: true,
                position: 'top',
            },
            datalabels: {
                color: '#ffffff',
                formatter: (value) => {
                    const total = attended + notAttended;
                    const percentage = ((value / total) * 100).toFixed(2);
                    return `${percentage}%`;
                },
            },
        },
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
            <h1>Dashboard</h1>
            <Pie data={pieData} options={options} plugins={[ChartDataLabels]} /> {/* Pass the plugin here */}
            <h2>Tiempo restante para el evento:</h2>
            {message ? (
                <p>{message}</p>
            ) : (
                <p>{days} dias, {hours} horas, {minutes} minutos, {seconds} segundos</p>
            )}
            <h2>Asistencia</h2>
            <p>{attended} asistentes ({attendedPercentage}%)</p>
            <p>{notAttended} no asistentes ({notAttendedPercentage}%)</p>
        </div>
    );
}

export default Dashboard;
