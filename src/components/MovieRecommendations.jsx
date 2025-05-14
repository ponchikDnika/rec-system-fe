// src/components/MovieRecommendations.js
import React, {useEffect, useState} from 'react';
import {
    fetchRandomMovies,
    fetchMoviesByTag,
    fetchSimilarMovies,
    fetchMovieDetails,
    fetchMoviesByGenre,
    searchMoviesByTitle
} from '../services/api';

export default function MovieRecommendations() {
    const [movies, setMovies] = useState([]);
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [error, setError] = useState(null);
    const [infoMessage, setInfoMessage] = useState(null);

    // pagination state
    const [page, setPage] = useState(1);
    const [hasNext, setHasNext] = useState(false);
    const limit = 9;

    const [searchStr, setSearchStr] = useState('');

    // remember current load mode & param
    const [mode, setMode] = useState('random'); // 'random' | 'tag' | 'similar' | 'genre'
    const [param, setParam] = useState(null);

    // core loader
    const runLoad = (loader, p, ...args) => {
        loader(...args, p, limit)
            .then(res => {
                console.log(res);
                const {data} = res.data;       // assume API returns { data: [...], ... }
                console.log(data);
                setMovies(data);
                setPage(p);
                setHasNext(data.length === limit);
                setSelectedMovie(loader === fetchSimilarMovies ? res.data.details : null);
                setInfoMessage(null);
                setError(null);
            })
            .catch(() => setError('Failed to fetch movies.'));
    };

    const loadRandom = p => {
        setMode('random');
        setParam(null);
        runLoad(fetchRandomMovies, p);
    };
    const loadByTag = (tag, p) => {
        setMode('tag');
        setParam(tag);
        runLoad(fetchMoviesByTag, p, tag);
    };
    const loadByGenre = (genre, p) => {
        setMode('genre');
        setParam(genre);
        runLoad(fetchMoviesByGenre, p, genre);
    };
    const loadSimilar = (id, p) => {
        setMode('similar');
        setParam(id);
        // special: we need details + similar list
        Promise.all([
            fetchMovieDetails(id),
            fetchSimilarMovies(id, p, limit),
        ])
            .then(([detRes, simRes]) => {
                const details = detRes.data;
                const data = simRes.data.data;
                setSelectedMovie(details);
                setMovies(data);
                setPage(p);
                setHasNext(data.length === limit);
                setInfoMessage(data.length === 0
                    ? "No similar movies found. Showing random."
                    : null
                );
                if (data.length === 0) loadRandom(1);
                setError(null);
            })
            .catch(() => setError("Failed to load movie or recommendations."));
    };

    const loadBySearch = (str, p) => {
        setMode('search');
        setParam(str);
        runLoad(searchMoviesByTitle, p, str);
    };

    // initial
    useEffect(() => loadRandom(1), []);

    const handleTagClick = tag => loadByTag(tag, 1);
    const handleGenreClick = genre => loadByGenre(genre, 1);
    const handleMovieClick = id => loadSimilar(id, 1);
    const handleSearch = () => loadBySearch(searchStr, 1);

    const handlePrev = () => {
        if (page === 1) return;
        const np = page - 1;
        if (mode === 'random') loadRandom(np);
        if (mode === 'tag') loadByTag(param, np);
        if (mode === 'genre') loadByGenre(param, np);
        if (mode === 'similar') loadSimilar(param, np);
    };
    const handleNext = () => {
        if (!hasNext) return;
        const np = page + 1;
        if (mode === 'random') loadRandom(np);
        if (mode === 'tag') loadByTag(param, np);
        if (mode === 'genre') loadByGenre(param, np);
        if (mode === 'similar') loadSimilar(param, np);
    };

    return (
        <div className="container py-4">
            <h1 className="display-6 text-center mb-xl-6">Movies Recommendations System</h1>

            {/* ── Search Panel ────────────────────────────────────────────── */}
            <div className="input-group mb-4">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Search by title..."
                    value={searchStr}
                    onChange={e => setSearchStr(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                />
                <button className="btn btn-primary" onClick={handleSearch}>
                    Search
                </button>
            </div>

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
                                    style={{cursor: 'pointer'}}
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
                                        style={{cursor: 'pointer'}}
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
                                    style={{cursor: 'pointer'}}
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
                                            style={{cursor: 'pointer'}}
                                        >
                      {g}
                    </span>
                                    ))}
                                </p>
                                <p className="card-text"><strong>Links:</strong>
                                    {movie.imdbId && (
                                        <a
                                            href={`https://www.imdb.com/title/${movie.imdbId}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-sm btn-outline-primary me-2"
                                        >
                                            IMDB
                                        </a>
                                    )}
                                    {movie.tmdbId && (
                                        <a
                                            href={`https://www.themoviedb.org/movie/${movie.tmdbId}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-sm btn-outline-primary"
                                        >
                                            TMDB
                                        </a>
                                    )}
                                </p>
                                <p className="card-text">
                                    <strong>Tags:</strong>{' '}
                                    {movie.tags && movie.tags.length > 0 ? (
                                        movie.tags.map((t, i) => (
                                            <span
                                                key={i}
                                                onClick={() => handleTagClick(t)}
                                                className="badge bg-success me-1"
                                                style={{cursor: 'pointer'}}
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

            <nav className="d-flex justify-content-center mt-4">
                <button
                    className="btn btn-outline-primary me-2"
                    onClick={handlePrev}
                    disabled={page === 1}
                >
                    ← Prev
                </button>
                <button
                    className="btn btn-outline-primary"
                    onClick={handleNext}
                    disabled={!hasNext}
                >
                    Next →
                </button>
            </nav>
        </div>
    );
}
