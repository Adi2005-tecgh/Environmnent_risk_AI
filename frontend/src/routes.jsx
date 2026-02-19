import React from 'react';
import LandingPage from './pages/LandingPage';
import CitizenDashboard from './pages/CitizenDashboard';
import GovernmentDashboard from './pages/GovernmentDashboard';

export const routes = [
    {
        path: '/',
        element: <LandingPage />,
    },
    {
        path: '/citizen',
        element: <CitizenDashboard />,
    },
    {
        path: '/government',
        element: <GovernmentDashboard />,
    }
];

export default routes;
