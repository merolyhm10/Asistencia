import { createBrowserRouter } from 'react-router-dom';
import Login from '../Login.jsx';
import View from '../Pages/View.jsx';
import CrearEvento from '../Pages/CrearEvento.jsx';
import EventDetail from '../Pages/EventDetail.jsx';
import Dashboard from '../Pages/Dashboard.jsx';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <View />,
        errorElement: <div>Error: pagina no encontrada</div>
    },
    {
        path: '/Login',
        element: <Login />,
        errorElement: <div>Error: pagina no encontrada</div>
    },
    {
        path: '/Crear',
        element: <CrearEvento />,
        errorElement: <div>Error: pagina no encontrada</div>
    },
    {
        path: '/EventDetails/:eventId',
        element: <EventDetail />,
        errorElement: <div>Error: pagina no encontrada</div>
    },
    {
        path: '/Dashboard/:eventId',
        element: <Dashboard />,
        errorElement: <div>Error: pagina no encontrada</div>
    }
]);
