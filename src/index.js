import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';  // ← add this
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import MovieRecommendations from './components/MovieRecommendations';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <MovieRecommendations />
    </React.StrictMode>
);

reportWebVitals();