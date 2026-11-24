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

export default function Special_FrontmanLowerThan({ isOpen, onClose, onOpenModifyForm }) {
    const [numberVal, setNumberVal] = useState('');
    const [appliedNumber, setAppliedNumber] = useState(null);
    const [bands, setBands] = useState([]);
    const [isSearched, setIsSearched] = useState(false);

    const [page, setPage] = useState(0);
    const pageSize = 5;
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const performSearch = useCallback((num, targetPage = 0) => {
        if (num === null || num === '' || isNaN(num)) return;

        const params = new URLSearchParams({
            page: String(targetPage),
            size: String(pageSize),
        });

        apiFetch(`/bands/frontman-lower/${num}?${params.toString()}`)
            .then(response => {
                if (!response.ok) throw new Error("Ошибка при запросе");
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
        if (!isOpen || !isSearched || appliedNumber === null) return;
        performSearch(appliedNumber, page);
    }, [isOpen, isSearched, appliedNumber, page, performSearch]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (numberVal === '' || isNaN(numberVal)) {
            toast.warn("Введите корректное число для ID фронтмена!");
            return;
        }

        const parsedNum = Number(numberVal);
        setIsSearched(true);
        setPage(0);
        setAppliedNumber(parsedNum);
        toast.success("Поиск выполнен");
    };

    const handleReset = () => {
        setNumberVal('');
        setAppliedNumber(null);
        setIsSearched(false);
        setBands([]);
        setPage(0);
        setTotalPages(1);
        setTotalItems(0);
    };

    useEffect(() => {
        if (!isOpen || !isSearched || appliedNumber === null) return;

        const eventSource = createEventSource();

        eventSource.addEventListener('entity-changed', (event) => {
            try {
                const payload = JSON.parse(event.data);
                if (payload.entity === 'band') {
                    performSearch(appliedNumber, page);
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
    }, [isOpen, isSearched, appliedNumber, page, performSearch]);

    useEffect(() => {
        if (!isOpen) {
            setNumberVal('');
            setAppliedNumber(null);
            setBands([]);
            setIsSearched(false);
            setPage(0);
            setTotalPages(1);
            setTotalItems(0);
        }
    }, [isOpen]);

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
            if (appliedNumber !== null) {
                performSearch(appliedNumber, page);
            }
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
                <h2>Группы с ID фронтмена меньше заданного</h2>
                {onClose && <button onClick={onClose}>Закрыть</button>}
            </div>

            <form onSubmit={handleSearch} style={{ margin: '15px 0', display: 'flex', gap: '10px' }}>
                <input
                    type="number"
                    value={numberVal}
                    onChange={(e) => setNumberVal(e.target.value)}
                    style={{ padding: '5px' }}
                />
                <button type="submit">Найти</button>
                {isSearched && (
                    <button type="button" onClick={handleReset}>Сбросить</button>
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
                            <td>{b.frontMan?.name} (ID: {b.frontMan?.id})</td>
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

            {isSearched && (
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
            )}
        </div>
    );
}