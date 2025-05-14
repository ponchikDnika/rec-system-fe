// src/components/MovieRecommendations.js
import React, { useEffect, useState } from 'react';
import {
    fetchRandomMovies,
    fetchMoviesByTag,
    fetchSimilarMovies,
    fetchMovieDetails, fetchMoviesByGenre
} from '../services/api';

export default function MovieRecommendations() {
    const [movies, setMovies] = useState([]);
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [error, setError] = useState(null);
    const [infoMessage, setInfoMessage] = useState(null);

    // pagination state
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const size = 12;

    // remember what we’re loading for pagination
    const [mode, setMode] = useState('random');   // 'random' | 'tag' | 'similar' | 'genre'
    const [param, setParam] = useState(null);     // tag string or movieId

    // loader helpers
    const loadRandom = p => {
        setMode('random'); setParam(null);
        fetchRandomMovies(p, size)
            .then(res => {
                const { data, currentPage, totalPages } = res.data;
                setMovies(data);
                setPage(currentPage);
                setTotalPages(totalPages);
                setSelectedMovie(null);
                setInfoMessage(null);
            })
            .catch(() => setError('Failed to fetch movies.'));
    };

    const loadByTag = (tag, p) => {
        setMode('tag'); setParam(tag);
        fetchMoviesByTag(tag, p, size)
            .then(res => {
                const { data, currentPage, totalPages } = res.data;
                setMovies(data);
                setPage(currentPage);
                setTotalPages(totalPages);
                setSelectedMovie(null);
                setInfoMessage(null);
            })
            .catch(() => setError(`Failed to fetch movies with tag: ${tag}`));
    };

    const loadByGenre = (tag, p) => {
        setMode('genre'); setParam(tag);
        fetchMoviesByGenre(tag, p, size)
            .then(res => {
                const { data, currentPage, totalPages } = res.data;
                setMovies(data);
                setPage(currentPage);
                setTotalPages(totalPages);
                setSelectedMovie(null);
                setInfoMessage(null);
            })
            .catch(() => setError(`Failed to fetch movies with tag: ${tag}`));
    };

    const loadSimilar = (movieId, p) => {
        setMode('similar'); setParam(movieId);
        Promise.all([
            fetchMovieDetails(movieId),
            fetchSimilarMovies(movieId, p, size)
        ])
            .then(([detailsRes, similarRes]) => {
                setSelectedMovie(detailsRes.data);
                const { data, currentPage, totalPages } = similarRes.data;
                if (data.length) {
                    setMovies(data);
                    setPage(currentPage);
                    setTotalPages(totalPages);
                    setInfoMessage(null);
                } else {
                    setInfoMessage("No similar movies found. Here's some random ones:");
                    loadRandom(1);
                }
            })
            .catch(() => setError("Failed to load movie or recommendations."));
    };

    // initial load
    useEffect(() => loadRandom(1), []);

    const handleTagClick = tag => loadByTag(tag, 1);
    const handleGenreClick = genre => loadByGenre(genre, 1);
    const handleMovieClick = id => loadSimilar(id, 1);

    const handlePageChange = newPage => {
        if (newPage < 1 || newPage > totalPages) return;
        if (mode === 'random') loadRandom(newPage);
        else if (mode === 'tag') loadByTag(param, newPage);
        else if (mode === 'similar') loadSimilar(param, newPage);
        else if (mode === 'genre') loadByGenre(param, newPage);
    };

    return (
        <div className="container py-4">
            <h1 className="display-6 text-center mb-4">Movie Recommendations</h1>
            {error && <div className="alert alert-danger text-center">{error}</div>}
            {infoMessage && <div className="alert alert-warning text-center">{infoMessage}</div>}

            {/* Selected Movie */}
            {selectedMovie && (
                <div className="card mb-4 shadow-sm">
                    <div className="card-body">
                        <h2 className="card-title">{selectedMovie.title}</h2>
                        <p>
                            <strong>Genres:</strong>{' '}
                            {selectedMovie.genres.map((g, i) => (
                                <span
                                    key={i}
                                    onClick={() => handleGenreClick(g)}
                                    className="badge bg-info text-dark me-1"
                                    style={{ cursor: 'pointer' }}
                                >
                  {g}
                </span>
                            ))}
                        </p>
                        <p>
                            <strong>Links:</strong>{' '}
                            {selectedMovie.imdbId && (
                                <a
                                    href={`https://www.imdb.com/title/${selectedMovie.imdbId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-sm btn-outline-primary me-2"
                                >
                                    IMDB
                                </a>
                            )}
                            {selectedMovie.tmdbId && (
                                <a
                                    href={`https://www.themoviedb.org/movie/${selectedMovie.tmdbId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-sm btn-outline-primary"
                                >
                                    TMDB
                                </a>
                            )}
                        </p>
                        <p>
                            <strong>Tags:</strong>{' '}
                            {selectedMovie.tags && selectedMovie.tags.length > 0 ? (
                                selectedMovie.tags.map((t, i) => (
                                    <span
                                        key={i}
                                        onClick={() => handleTagClick(t)}
                                        className="badge bg-success me-1"
                                        style={{ cursor: 'pointer' }}
                                    >
                    {t}
                  </span>
                                ))
                            ) : (
                                <span className="text-muted">No tags</span>
                            )}
                        </p>
                    </div>
                </div>
            )}

            {/* Movie Grid */}
            <div className="row g-3">
                {movies.map(movie => (
                    <div key={movie.movieId} className="col-12 col-sm-6 col-md-4">
                        <div className="card h-100 shadow-sm">
                            <div className="card-header">
                                <h5
                                    onClick={() => handleMovieClick(movie.movieId)}
                                    className="card-title text-primary mb-0"
                                    style={{ cursor: 'pointer' }}
                                >
                                    {movie.title}
                                </h5>
                            </div>
                            <div className="card-body">
                                <p className="card-text">
                                    <strong>Genres:</strong>{' '}
                                    {movie.genres.map((g, i) => (
                                        <span
                                            key={i}
                                            onClick={() => handleGenreClick(g)}
                                            className="badge bg-info text-dark me-1"
                                            style={{ cursor: 'pointer' }}
                                        >
                      {g}
                    </span>
                                    ))}
                                </p>
                                <p className="card-text"><strong>Links:</strong></p>
                                <ul className="list-unstyled ms-3">
                                    {movie.imdbId && (
                                        <li>
                                            <a
                                                href={`https://www.imdb.com/title/${movie.imdbId}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-decoration-none"
                                            >
                                                IMDB
                                            </a>
                                        </li>
                                    )}
                                    {movie.tmdbId && (
                                        <li>
                                            <a
                                                href={`https://www.themoviedb.org/movie/${movie.tmdbId}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-decoration-none"
                                            >
                                                TMDB
                                            </a>
                                        </li>
                                    )}
                                </ul>
                                <p className="card-text">
                                    <strong>Tags:</strong>{' '}
                                    {movie.tags && movie.tags.length > 0 ? (
                                        movie.tags.map((t, i) => (
                                            <span
                                                key={i}
                                                onClick={() => handleTagClick(t)}
                                                className="badge bg-success me-1"
                                                style={{ cursor: 'pointer' }}
                                            >
                        {t}
                      </span>
                                        ))
                                    ) : (
                                        <span className="text-muted">No tags</span>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <nav className="mt-4">
                    <ul className="pagination justify-content-center">
                        <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={() => handlePageChange(page - 1)}>
                                Previous
                            </button>
                        </li>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                            <li key={p} className={`page-item ${p === page ? 'active' : ''}`}>
                                <button className="page-link" onClick={() => handlePageChange(p)}>
                                    {p}
                                </button>
                            </li>
                        ))}
                        <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={() => handlePageChange(page + 1)}>
                                Next
                            </button>
                        </li>
                    </ul>
                </nav>
            )}
        </div>
    );
}
