import React from 'react';
import Dashboard from './pages/Dashboard';
import ViolationUpload from './components/ViolationUpload';

export const routes = [
    {
        path: '/',
        element: <Dashboard />,
    },
    {
        path: '/report',
        element: <ViolationUpload />,
    }
];

export default routes;
