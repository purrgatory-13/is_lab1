import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
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

export default function Special_SubstrSearch({ isOpen, onClose, onOpenModifyForm }) {
    const [searchStr, setSearchStr] = useState('');
    const [appliedQuery, setAppliedQuery] = useState('');
    const [bands, setBands] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const [page, setPage] = useState(0);
    const pageSize = 5;
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const loadBands = useCallback((query = '', targetPage = 0) => {
        const params = new URLSearchParams({
            page: String(targetPage),
            size: String(pageSize),
        });

        if (query.trim()) {
            params.set('filterField', 'name');
        }

        const path = query.trim()
            ? `/bands/substr/${encodeURIComponent(query)}?${params.toString()}`
            : `/bands?${params.toString()}`;

        apiFetch(path)
            .then(response => {
                if (!response.ok) throw new Error("Ошибка при получении данных");
                return response.json();
            })
            .then(data => {
                const items = data.items ?? [];
                if (items.length === 0 && targetPage > 0) {
                    setPage(prev => Math.max(0, prev - 1));
                    return;
                }
                setBands(items);
                setTotalPages(data.totalPages || 1);
                setTotalItems(data.totalItems ?? 0);
            })
            .catch(error => {
                console.error(error);
                setBands([]);
                setTotalPages(1);
                setTotalItems(0);
            });
    }, [pageSize]);

    useEffect(() => {
        if (!isOpen) return;
        loadBands(appliedQuery, page);
    }, [isOpen, appliedQuery, page, loadBands]);

    useEffect(() => {
        if (!isOpen) return;

        const eventSource = createEventSource();

        eventSource.addEventListener('entity-changed', (event) => {
            try {
                const payload = JSON.parse(event.data);
                if (payload.entity === 'band') {
                    loadBands(appliedQuery, page);
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
    }, [isOpen, appliedQuery, page, loadBands]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchStr.trim()) {
            toast.warn("Введите подстроку для поиска!");
            return;
        }

        setIsSearching(true);
        setPage(0);
        setAppliedQuery(searchStr.trim());
        toast.success("Поиск выполнен");
    };

    const handleResetSearch = () => {
        setSearchStr('');
        setAppliedQuery('');
        setIsSearching(false);
        setPage(0);
    };

    const handleDeleteBand = async (id) => {
        if (!window.confirm(`Точно удалить группу с ID ${id}?`)) return;

        try {
            const response = await apiFetch(`/bands/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(errText || "Не удалось удалить группу");
            }

            toast.success(`Группа с ID ${id} удалена`);
            loadBands(appliedQuery, page);
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        }
    };

    const handleNextPage = () => {
        if (page + 1 < totalPages) setPage(prev => prev + 1);
    };

    const handlePrevPage = () => {
        if (page > 0) setPage(prev => prev - 1);
    };

    if (!isOpen) return null;

    return (
        <div style={{ marginTop: '20px', borderTop: '2px solid #ccc', paddingTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Поиск групп по подстроке в названии</h2>
                {onClose && <button onClick={onClose}>Закрыть поиск</button>}
            </div>

            <form onSubmit={handleSearch} style={{ margin: '15px 0', display: 'flex', gap: '10px' }}>
                <input
                    type="text"
                    value={searchStr}
                    onChange={(e) => setSearchStr(e.target.value)}
                    placeholder="Введите подстроку..."
                    style={{ padding: '5px' }}
                />
                <button type="submit">Искать</button>
                {isSearching && (
                    <button type="button" onClick={handleResetSearch}>Сбросить</button>
                )}
            </form>

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
                    bands.map((b) => (
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
                        <td colSpan="13" style={{ textAlign: 'center' }}>Ничего не найдено</td>
                    </tr>
                )}
                </tbody>
            </table>

            <div style={{ marginTop: '15px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <button type="button" onClick={handlePrevPage} disabled={page <= 0}>
                    Назад
                </button>
                <span>
                    Страница {totalItems === 0 ? 0 : page + 1} из {totalItems === 0 ? 0 : totalPages} (объектов: {totalItems})
                </span>
                <button type="button" onClick={handleNextPage} disabled={page + 1 >= totalPages}>
                    Вперед
                </button>
            </div>
        </div>
    );
}