import {toast} from 'react-toastify';
import { useState, useEffect } from 'react';

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

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;
    const fetchBands = () => {
        if (isSearching) return;

        fetch('http://localhost:8080/is_lab1/bands')
            .then(response => {
                if (!response.ok) {
                    throw new Error("Server Error")
                }
                return response.json();
            })
            .then(data => {
                const sorted = [...data].sort((a, b) => a.id - b.id);
                setBands(sorted);
            })
            .catch(error => {
                console.error("Не удалось загрузить группы:", error);
            });
    };

    useEffect(() => {
        fetchBands();
        const interval = setInterval(fetchBands, 3000);
        return () => clearInterval(interval);
    }, [isSearching]);

    const handleSearchById = (e) => {
        e.preventDefault();
        if (!searchId.trim()) {
            toast.warn("Введите ID для поиска!");
            return;
        }

        setIsSearching(true);
        setCurrentPage(1);

        fetch(`http://localhost:8080/is_lab1/bands/${searchId}`)
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
                toast.success(`Найдена группа с ID: ${searchId}`);
            })
            .catch(error => {
                console.error(error);
                toast.error(error.message);
                setBands([]);
            });
    };

    const handleResetSearch = () => {
        setSearchId('');
        setIsSearching(false);
        setCurrentPage(1);
        fetchBands();
    };

    const handleDeleteBand = (id) => {
        if (!window.confirm(`Точно удалить группу с ID ${id}?`)) return;

        fetch(`http://localhost:8080/is_lab1/bands/${id}`, {
            method: 'DELETE',
        })
            .then(async response => {
                if (!response.ok) {
                    const errText = await response.text();
                    throw new Error(errText || "Не удалось удалить группу");
                }
                toast.success(`Группа с ID ${id} удалена`);
                setBands(bands.filter(b => b.id !== id));
            })
            .catch(error => {
                console.error(error);
                toast.error(error.message);
            });
    };

    function addBandButton() {
        onOpenAddForm();
    }

    const totalPages = Math.ceil(bands.length / pageSize) || 1;
    const indexOfLastItem = currentPage * pageSize;
    const indexOfFirstItem = indexOfLastItem - pageSize;
    const currentBands = bands.slice(indexOfFirstItem, indexOfLastItem);

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    return (
        <div>
            <h1>Список музыкальных групп</h1>

            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
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
                {currentBands.length > 0 ? (
                    currentBands.map((b)=>(
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
                <button onClick={handlePrevPage} disabled={currentPage === 1}>
                    Назад
                </button>
                <span>Страница {currentPage} из {totalPages}</span>
                <button onClick={handleNextPage} disabled={currentPage === totalPages || totalPages === 0}>
                    Вперед
                </button>
            </div>
        </div>
    );
}