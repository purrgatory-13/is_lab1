import {toast} from 'react-toastify';
import { useState, useEffect, useCallback } from 'react';

export default function LocationTable({ onOpenAddLocationForm, onOpenModifyLocationForm }) {

    const [locations, setLocations] = useState([]);
    const [searchId, setSearchId] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const [filterField, setFilterField] = useState('name');
    const [filterValue, setFilterValue] = useState('');
    const [appliedFilter, setAppliedFilter] = useState({ field: '', value: '' });

    const [page, setPage] = useState(0);
    const pageSize = 5;
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const fetchLocations = useCallback(() => {
        if (isSearching) return;

        const params = new URLSearchParams({
            page: String(page),
            size: String(pageSize),
        });

        if (appliedFilter.field && appliedFilter.value !== '') {
            params.set('filterField', appliedFilter.field);
            params.set('filterValue', appliedFilter.value);
        }

        fetch(`http://localhost:8080/is_lab1/locations?${params.toString()}`)
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
                setLocations(items);
                setTotalPages(data.totalPages || 1);
                setTotalItems(data.totalItems ?? 0);
            })
            .catch(error => {
                console.error("Не удалось загрузить локации:", error);
            });
    }, [isSearching, page, pageSize, appliedFilter]);

    useEffect(() => {
        fetchLocations();
        const interval = setInterval(fetchLocations, 3000);
        return () => clearInterval(interval);
    }, [fetchLocations]);

    const handleSearchById = (e) => {
        e.preventDefault();
        if (!searchId.trim()) {
            toast.warn("Введите ID для поиска!");
            return;
        }

        setIsSearching(true);

        fetch(`http://localhost:8080/is_lab1/locations/${searchId}`)
            .then(response => {
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error("Локация с таким ID не найдена");
                    }
                    throw new Error("Ошибка сервера при поиске");
                }
                return response.json();
            })
            .then(data => {
                const results = Array.isArray(data) ? data : [data];
                setLocations(results);
                setTotalPages(1);
                setTotalItems(results.length);
                toast.success(`Найдена локация с ID: ${searchId}`);
            })
            .catch(error => {
                console.error(error);
                toast.error(error.message);
                setLocations([]);
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

    const handleDeleteLocation = async (id) => {
        if (!window.confirm(`Точно удалить локацию с ID ${id}?`)) return;

        try {
            const response = await fetch(`http://localhost:8080/is_lab1/locations/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(errText || "Не удалось удалить локацию");
            }

            toast.success(`Локация с ID ${id} удалена`);
            fetchLocations();
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        }
    };

    function addLocationButton() {
        if (onOpenAddLocationForm) {
            onOpenAddLocationForm();
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
            <h1>Список локаций</h1>

            <div style={{ marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                <button type="button" onClick={addLocationButton}>Добавить локацию</button>

                <form onSubmit={handleSearchById} style={{ display: 'flex', gap: '5px' }}>
                    <input
                        type="number"
                        placeholder="Введите ID локации"
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
                    <th>X</th>
                    <th>Y</th>
                    <th>Z</th>
                    <th>Название</th>
                    <th style={{ width: '50px' }}>:3</th>
                </tr>
                </thead>
                <tbody>
                {locations.length > 0 ? (
                    locations.map((l)=>(
                        <tr key={l.id}>
                            <td>{l.id}</td>
                            <td>{l.x}</td>
                            <td>{l.y}</td>
                            <td>{l.z}</td>
                            <td>{l.name}</td>
                            <td style={{ textAlign: 'center' }}>
                                {onOpenModifyLocationForm && (
                                    <button
                                        onClick={() => onOpenModifyLocationForm(l.id)}
                                        title="Изменить локацию"
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', marginRight: '5px' }}
                                    >
                                        ⚙️
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => handleDeleteLocation(l.id)}
                                    title="Удалить локацию"
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}
                                >
                                    ❌
                                </button>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="6" style={{ textAlign: 'center' }}>Локации не найдены</td>
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