import axios from 'axios';

const API_URL = 'http://localhost:8080';
const api = axios.create({baseURL: API_URL});
const defaultLimit = 9;

export const fetchRandomMovies = (page = 1, limit = defaultLimit) =>
    api.get('/movies', {params: {page, limit}});

export const fetchMovieDetails = movieId =>
    api.get(`/movies/${movieId}`);

export const searchMoviesByTitle = (searchStr, page = 1, limit = defaultLimit) =>
    api.get(`/movies/search`, {
        params: {searchStr, page, limit}
    });

export const fetchMoviesByTag = (tag, page = 1, limit = defaultLimit) =>
    api.get(`/recommendations/tag/${tag}`, {params: {page, limit}});

export const fetchMoviesByGenre = (genre, page = 1, limit = defaultLimit) =>
    api.get(`/recommendations/genre/${genre}`, {params: {page, limit}});

export const fetchSimilarMovies = (movieId, page = 1, limit = defaultLimit) =>
    api.get(`/recommendations/similar/${movieId}`, {params: {page, limit}});


