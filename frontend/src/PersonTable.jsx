import {toast} from 'react-toastify';
import { useState, useEffect, useCallback } from 'react';
import { apiFetch, createEventSource } from './api.js';

export default function PersonTable({ onOpenAddPersonForm, onOpenModifyPersonForm }) {

    const [persons, setPersons] = useState([]);
    const [searchId, setSearchId] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const [filterField, setFilterField] = useState('name');
    const [filterValue, setFilterValue] = useState('');
    const [appliedFilter, setAppliedFilter] = useState({ field: '', value: '' });

    const [page, setPage] = useState(0);
    const pageSize = 5;
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const fetchPersons = useCallback(() => {
        if (isSearching) return;

        const params = new URLSearchParams({
            page: String(page),
            size: String(pageSize),
        });

        if (appliedFilter.field && appliedFilter.value !== '') {
            params.set('filterField', appliedFilter.field);
            params.set('filterValue', appliedFilter.value);
        }

        apiFetch(`/person?${params.toString()}`)
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
                setPersons(items);
                setTotalPages(data.totalPages || 1);
                setTotalItems(data.totalItems ?? 0);
            })
            .catch(error => {
                console.error("Не удалось загрузить персон:", error);
            });
    }, [isSearching, page, pageSize, appliedFilter]);

    useEffect(() => {
        fetchPersons();

        const eventSource = createEventSource();

        eventSource.addEventListener('entity-changed', (event) => {
            try {
                const payload = JSON.parse(event.data);
                if (payload.entity === 'person' && !isSearching) {
                    fetchPersons();
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
    }, [fetchPersons, isSearching]);

    const handleSearchById = (e) => {
        e.preventDefault();
        if (!searchId.trim()) {
            toast.warn("Введите ID для поиска!");
            return;
        }

        setIsSearching(true);

        apiFetch(`/person/${searchId}`)
            .then(response => {
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error("Персона с таким ID не найдена");
                    }
                    throw new Error("Ошибка сервера при поиске");
                }
                return response.json();
            })
            .then(data => {
                const results = Array.isArray(data) ? data : [data];
                setPersons(results);
                setTotalPages(1);
                setTotalItems(results.length);
                toast.success(`Найдена персона с ID: ${searchId}`);
            })
            .catch(error => {
                console.error(error);
                toast.error(error.message);
                setPersons([]);
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

    const handleDeletePerson = async (id) => {
        if (!window.confirm(`Точно удалить персону с ID ${id}?`)) return;

        try {
            const response = await apiFetch(`/person/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(errText || "Не удалось удалить персону");
            }

            toast.success(`Персона с ID ${id} удалена`);
            fetchPersons();
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        }
    };

    function addPersonButton() {
        if (onOpenAddPersonForm) {
            onOpenAddPersonForm();
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
            <h1>Список персон</h1>

            <div style={{ marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                <button type="button" onClick={addPersonButton}>Добавить персону</button>

                <form onSubmit={handleSearchById} style={{ display: 'flex', gap: '5px' }}>
                    <input
                        type="number"
                        placeholder="Введите ID"
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
                        <option value="name">Имя</option>
                        <option value="passportID">Паспорт ID</option>
                        <option value="location.name">Локация</option>
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
                    <th>Имя</th>
                    <th>Цвет глаз</th>
                    <th>Цвет волос</th>
                    <th>Рост</th>
                    <th>Паспорт ID</th>
                    <th>Локация</th>
                    <th style={{ width: '50px' }}>:3</th>
                </tr>
                </thead>
                <tbody>
                {persons.length > 0 ? (
                    persons.map((p)=>(
                        <tr key={p.id}>
                            <td>{p.id}</td>
                            <td>{p.name}</td>
                            <td>{p.eyeColor || ''}</td>
                            <td>{p.hairColor || ''}</td>
                            <td>{p.height}</td>
                            <td>{p.passportID}</td>
                            <td>{p.location ? `${p.location.name || 'Без названия'} (X: ${p.location.x}, Y: ${p.location.y}, Z: ${p.location.z})` : ''}</td>
                            <td style={{ textAlign: 'center' }}>
                                {onOpenModifyPersonForm && (
                                    <button
                                        onClick={() => onOpenModifyPersonForm(p.id)}
                                        title="Изменить персону"
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', marginRight: '5px' }}
                                    >
                                        ⚙️
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => handleDeletePerson(p.id)}
                                    title="Удалить персону"
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}
                                >
                                    ❌
                                </button>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="8" style={{ textAlign: 'center' }}>Персоны не найдены</td>
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