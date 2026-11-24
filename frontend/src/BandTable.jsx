import {toast} from 'react-toastify';
import { useState, useEffect, useCallback } from 'react';
import { apiFetch, createEventSource } from './api.js';

function formatDate(dateString) {
    if (!dateString) return '';
    let cleanedString = dateString;
    if (typeof dateString === 'string') {
        cleanedString = dateString.replace(/\[.*\]$/, '');
    }

    const date = new Date(cleanedString);
    if (isNaN(date.getTime())) return dateString;

    return date.toLocaleString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

export default function BandTable({ onNavigate, onOpenAddForm, onOpenModifyForm}) {

    const [bands, setBands] = useState([]);
    const [searchId, setSearchId] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const [filterField, setFilterField] = useState('name');
    const [filterValue, setFilterValue] = useState('');
    const [appliedFilter, setAppliedFilter] = useState({ field: '', value: '' });

    const [page, setPage] = useState(0);
    const pageSize = 5;
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const fetchBands = useCallback(() => {
        if (isSearching) return;

        const params = new URLSearchParams({
            page: String(page),
            size: String(pageSize),
        });

        if (appliedFilter.field && appliedFilter.value !== '') {
            params.set('filterField', appliedFilter.field);
            params.set('filterValue', appliedFilter.value);
        }

        apiFetch(`/bands?${params.toString()}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Server Error")
                }
                return response.json();
            })
            .then(data => {
                const items = data.items ?? [];
                if (items.length === 0 && page > 0) {
                    setPage(prev => Math.max(0, prev - 1));
                    return;
                }
                setBands(items);
                setTotalPages(data.totalPages || 1);
                setTotalItems(data.totalItems ?? 0);
            })
            .catch(error => {
                console.error("Не удалось загрузить группы:", error);
            });
    }, [isSearching, page, pageSize, appliedFilter]);

    useEffect(() => {
        fetchBands();

        const eventSource = createEventSource();

        eventSource.addEventListener('entity-changed', (event) => {
            try {
                const payload = JSON.parse(event.data);
                if (payload.entity === 'band' && !isSearching) {
                    fetchBands();
                }
            } catch (err) {
                console.error('Ошибка парсинга SSE-события:', err);
            }
        });

        eventSource.onerror = (err) => {
            console.warn('SSE соединение прервано, браузер переподключится:', err);
        };

        return () => {
            eventSource.close();
        };
    }, [fetchBands, isSearching]);

    const handleSearchById = (e) => {
        e.preventDefault();
        if (!searchId.trim()) {
            toast.warn("Введите ID для поиска!");
            return;
        }

        setIsSearching(true);

        apiFetch(`/bands/${searchId}`)
            .then(response => {
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error("Группа с таким ID не найдена");
                    }
                    throw new Error("Ошибка сервера при поиске");
                }
                return response.json();
            })
            .then(data => {
                const results = Array.isArray(data) ? data : [data];
                setBands(results);
                setTotalPages(1);
                setTotalItems(results.length);
                toast.success(`Найдена группа с ID: ${searchId}`);
            })
            .catch(error => {
                console.error(error);
                toast.error(error.message);
                setBands([]);
                setTotalPages(1);
                setTotalItems(0);
            });
    };

    const handleResetSearch = () => {
        setSearchId('');
        setIsSearching(false);
        setPage(0);
    };

    const handleApplyFilter = (e) => {
        e.preventDefault();
        if (filterValue === '') {
            toast.warn("Введите точное значение для фильтрации");
            return;
        }
        setIsSearching(false);
        setSearchId('');
        setPage(0);
        setAppliedFilter({ field: filterField, value: filterValue });
    };

    const handleResetFilter = () => {
        setFilterValue('');
        setAppliedFilter({ field: '', value: '' });
        setPage(0);
    };

    const handleDeleteBand = (id) => {
        if (!window.confirm(`Точно удалить группу с ID ${id}?`)) return;

        apiFetch(`/bands/${id}`, {
            method: 'DELETE',
        })
            .then(async response => {
                if (!response.ok) {
                    const errText = await response.text();
                    throw new Error(errText || "Не удалось удалить группу");
                }
                toast.success(`Группа с ID ${id} удалена`);
                fetchBands();
            })
            .catch(error => {
                console.error(error);
                toast.error(error.message);
            });
    };

    function addBandButton() {
        onOpenAddForm();
    }

    const handleNextPage = () => {
        if (page + 1 < totalPages) {
            setPage(prev => prev + 1);
        }
    };

    const handlePrevPage = () => {
        if (page > 0) {
            setPage(prev => prev - 1);
        }
    };

    return (
        <div>
            <h1>Список музыкальных групп</h1>

            <div style={{ marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                <button onClick={addBandButton}>Добавить группу</button>

                <form onSubmit={handleSearchById} style={{ display: 'flex', gap: '5px' }}>
                    <input
                        type="number"
                        placeholder="Введите ID группы"
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value)}
                        style={{ padding: '5px' }}
                    />
                    <button type="submit">Найти по ID</button>
                    {isSearching && (
                        <button type="button" onClick={handleResetSearch}>Сбросить</button>
                    )}
                </form>

                <form onSubmit={handleApplyFilter} style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                    <select
                        value={filterField}
                        onChange={(e) => setFilterField(e.target.value)}
                        style={{ padding: '5px' }}
                    >
                        <option value="name">Название</option>
                        <option value="description">Описание</option>
                        <option value="bestAlbum.name">Лучший альбом</option>
                        <option value="frontMan.name">Фронтмен</option>
                        <option value="frontMan.passportID">Passport ID фронтмена</option>
                        <option value="frontMan.location.name">Локация фронтмена</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Точное совпадение"
                        value={filterValue}
                        onChange={(e) => setFilterValue(e.target.value)}
                        style={{ padding: '5px' }}
                    />
                    <button type="submit">Фильтровать</button>
                    {appliedFilter.value !== '' && (
                        <button type="button" onClick={handleResetFilter}>Сбросить фильтр</button>
                    )}
                </form>
            </div>

            <table>
                <thead>
                <tr>
                    <th>id</th>
                    <th>Название</th>
                    <th>Координаты</th>
                    <th>Дата создания</th>
                    <th>Жанр</th>
                    <th>Участники</th>
                    <th>Синглы</th>
                    <th>Описание</th>
                    <th>Лучший альбом</th>
                    <th>Кол-во альбомов</th>
                    <th>Дата основания</th>
                    <th>Фронтмен</th>
                    <th style={{ width: '50px' }}>:3</th>
                </tr>
                </thead>
                <tbody>
                {bands.length > 0 ? (
                    bands.map((b)=>(
                        <tr key={b.id}>
                            <td>{b.id}</td>
                            <td>{b.name}</td>
                            <td>{b.coordinates ? `X: ${b.coordinates.x}, Y: ${b.coordinates.y}` : ''}</td>
                            <td>{formatDate(b.creationDate)}</td>
                            <td>{b.genre}</td>
                            <td>{b.numberOfParticipants}</td>
                            <td>{b.singlesCount}</td>
                            <td>{b.description}</td>
                            <td>{b.bestAlbum?.name}</td>
                            <td>{b.albumsCount}</td>
                            <td>{formatDate(b.establishmentDate)}</td>
                            <td>{b.frontMan?.name}</td>
                            <td style={{ textAlign: 'center' }}>
                                <button
                                    onClick={() => onOpenModifyForm(b.id)}
                                    title="Изменить группу"
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', marginRight: '5px' }}
                                >
                                    ⚙️
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDeleteBand(b.id)}
                                    title="Удалить группу"
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}
                                >
                                    ❌
                                </button>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="13" style={{ textAlign: 'center' }}>Группы не найдены</td>
                    </tr>
                )}
                </tbody>
            </table>

            <div style={{ marginTop: '15px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <button type="button" onClick={handlePrevPage} disabled={isSearching || page <= 0}>
                    Назад
                </button>
                <span>
                    Страница {totalItems === 0 ? 0 : page + 1} из {totalItems === 0 ? 0 : totalPages} (объектов: {totalItems})
                </span>
                <button type="button" onClick={handleNextPage} disabled={isSearching || page + 1 >= totalPages}>
                    Вперед
                </button>
            </div>
        </div>
    );
}