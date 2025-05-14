// import axios from 'axios';

// const API_URL = 'http://localhost:8080'; // Update with your backend URL

// // Axios instance with auth
// const api = axios.create({
//     baseURL: API_URL,
//     headers: { 'Content-Type': 'multipart/form-data' }
// });

// api.interceptors.request.use(config => {
//     const token = localStorage.getItem('token');
//     if (token) {
//         config.headers['Authorization'] = `Bearer ${token}`;
//     }
//     return config;
// });

// export const signup = (data) => api.post('/signup', data);
// export const login = (data) => api.post('/login', data);
// export const getProfile = () => api.get('/profile/me');
// export const createPost = (data) => api.post('/posts', data, {
//     headers: { 'Content-Type': 'application/json' }
// });
// export const getPosts = () => api.get('/posts');
// export const deletePost = (postId) => api.delete(`/posts/${postId}`);

// src/services/api.js
import axios from 'axios';

const API_URL = 'http://localhost:8080'; // your backend
const api = axios.create({ baseURL: API_URL });

export const fetchRandomMovies = (page = 1, size = 12) =>
    api.get('/movies', { params: { page, size } });

export const fetchMoviesByTag = (tag, page = 1, size = 12) =>
    api.get(`/recommendations/tag/${tag}`, { params: { page, size } });

export const fetchMoviesByGenre = (genre, page = 1, size = 12) =>
    api.get(`/recommendations/genre/${genre}`, { params: { page, size } });

export const fetchSimilarMovies = (movieId, page = 1, size = 12) =>
    api.get(`/recommendations/similar/${movieId}`, { params: { page, size } });

export const fetchMovieDetails = movieId =>
    api.get(`/movie/${movieId}`);


