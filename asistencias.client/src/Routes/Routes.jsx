import { createBrowserRouter } from 'react-router-dom';
import Login from '../Login.jsx';
import View from '../Pages/View.jsx';
import CrearEvento from '../Pages/CrearEvento.jsx';
import EventDetail from '../Pages/EventDetail.jsx';

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
    }
]);
