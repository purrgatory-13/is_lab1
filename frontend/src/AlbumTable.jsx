import {toast} from 'react-toastify';
import { useState, useEffect, useCallback } from 'react';
import { apiFetch, createEventSource } from './api.js';

export default function AlbumTable({ onOpenAddAlbumForm, onOpenModifyAlbumForm }) {

    const [albums, setAlbums] = useState([]);
    const [searchId, setSearchId] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const [filterField, setFilterField] = useState('name');
    const [filterValue, setFilterValue] = useState('');
    const [appliedFilter, setAppliedFilter] = useState({ field: '', value: '' });

    const [page, setPage] = useState(0);
    const pageSize = 5;
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const fetchAlbums = useCallback(() => {
        if (isSearching) return;

        const params = new URLSearchParams({
            page: String(page),
            size: String(pageSize),
        });

        if (appliedFilter.field && appliedFilter.value !== '') {
            params.set('filterField', appliedFilter.field);
            params.set('filterValue', appliedFilter.value);
        }

        apiFetch(`/albums?${params.toString()}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Server Error");
                }
                return response.json();
            })
            .then(data => {
                const items = data.items ?? [];
                if (items.length === 0 && page > 0) {
                    setPage(prev => Math.max(0, prev - 1));
                    return;
                }
                setAlbums(items);
                setTotalPages(data.totalPages || 1);
                setTotalItems(data.totalItems ?? 0);
            })
            .catch(error => {
                console.error("Не удалось загрузить альбомы:", error);
            });
    }, [isSearching, page, pageSize, appliedFilter]);

    useEffect(() => {
        fetchAlbums();

        const eventSource = createEventSource();

        eventSource.addEventListener('entity-changed', (event) => {
            try {
                const payload = JSON.parse(event.data);
                if (payload.entity === 'album' && !isSearching) {
                    fetchAlbums();
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
    }, [fetchAlbums, isSearching]);

    const handleSearchById = (e) => {
        e.preventDefault();
        if (!searchId.trim()) {
            toast.warn("Введите ID для поиска!");
            return;
        }

        setIsSearching(true);

        apiFetch(`/albums/${searchId}`)
            .then(response => {
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error("Альбом с таким ID не найден");
                    }
                    throw new Error("Ошибка сервера при поиске");
                }
                return response.json();
            })
            .then(data => {
                const results = Array.isArray(data) ? data : [data];
                setAlbums(results);
                setTotalPages(1);
                setTotalItems(results.length);
                toast.success(`Найден альбом с ID: ${searchId}`);
            })
            .catch(error => {
                console.error(error);
                toast.error(error.message);
                setAlbums([]);
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

    const handleDeleteAlbum = async (id) => {
        if (!window.confirm(`Точно удалить альбом с ID ${id}?`)) return;

        try {
            const response = await apiFetch(`/albums/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(errText || "Не удалось удалить альбом");
            }

            toast.success(`Альбом с ID ${id} удален`);
            fetchAlbums();
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        }
    };

    function addAlbumButton() {
        if (onOpenAddAlbumForm) {
            onOpenAddAlbumForm();
        }
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
            <h1>Список альбомов</h1>

            <div style={{ marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                <button type="button" onClick={addAlbumButton}>Добавить альбом</button>

                <form onSubmit={handleSearchById} style={{ display: 'flex', gap: '5px' }}>
                    <input
                        type="number"
                        placeholder="Введите ID альбома"
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
                    <th>Треки</th>
                    <th>Продажи</th>
                    <th style={{ width: '50px' }}>:3</th>
                </tr>
                </thead>
                <tbody>
                {albums.length > 0 ? (
                    albums.map((a)=>(
                        <tr key={a.id}>
                            <td>{a.id}</td>
                            <td>{a.name}</td>
                            <td>{a.tracks}</td>
                            <td>{a.sales}</td>
                            <td style={{ textAlign: 'center' }}>
                                {onOpenModifyAlbumForm && (
                                    <button
                                        onClick={() => onOpenModifyAlbumForm(a.id)}
                                        title="Изменить альбом"
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', marginRight: '5px' }}
                                    >
                                        ⚙️
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => handleDeleteAlbum(a.id)}
                                    title="Удалить альбом"
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}
                                >
                                    ❌
                                </button>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="5" style={{ textAlign: 'center' }}>Альбомы не найдены</td>
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