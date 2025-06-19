import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'  // Global styles for your application
import { RouterProvider } from "react-router-dom";  // Import RouterProvider to use the router
import { router } from "./routes";  // Import the router configuration
import { BackendURL } from './components/BackendURL';
import AppContext from './Context/AppContext';

const Main = () => {

    if (! import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_BACKEND_URL == "") return (
        <React.StrictMode>
            <BackendURL />
        </React.StrictMode>
    );
    return (
        <React.StrictMode>
            {/* Provide global state to all components */}
            {/* Set up routing for the application */}
            <RouterProvider router={router}>
            </RouterProvider>
        </React.StrictMode>
    );
}

const AppWithContext = AppContext(Main);
// Render the Main component into the root DOM element.
ReactDOM.createRoot(document.getElementById('root')).render(<AppWithContext />)
