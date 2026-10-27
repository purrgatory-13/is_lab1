import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

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
    const [bands, setBands] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // Состояния для пагинации
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

    // Загрузка всех групп или результатов поиска
    const loadBands = (query = '') => {
        const url = query.trim()
            ? `http://localhost:8080/is_lab1/bands/substr/${encodeURIComponent(query)}`
            : 'http://localhost:8080/is_lab1/bands';

        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error("Ошибка при получении данных");
                return response.json();
            })
            .then(data => {
                const sorted = [...data].sort((a, b) => a.id - b.id);
                setBands(sorted);
            })
            .catch(error => {
                console.error(error);
                setBands([]);
            });
    };

    // При открытии компонента грузим все группы
    useEffect(() => {
        if (isOpen) {
            loadBands(searchStr);
        }
    }, [isOpen]);

    // Поллинг: обновляем данные каждые 3 секунды
    useEffect(() => {
        if (!isOpen) return;

        const interval = setInterval(() => {
            loadBands(searchStr);
        }, 3000);

        return () => clearInterval(interval);
    }, [isOpen, searchStr]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchStr.trim()) {
            toast.warn("Введите подстроку для поиска!");
            return;
        }

        setIsSearching(true);
        setCurrentPage(1);
        loadBands(searchStr);
        toast.success("Поиск выполнен");
    };

    const handleResetSearch = () => {
        setSearchStr('');
        setIsSearching(false);
        setCurrentPage(1);
        loadBands('');
    };

    const handleDeleteBand = async (id) => {
        if (!window.confirm(`Точно удалить группу с ID ${id}?`)) return;

        try {
            const response = await fetch(`http://localhost:8080/is_lab1/bands/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(errText || "Не удалось удалить группу");
            }

            toast.success(`Группа с ID ${id} удалена`);
            setBands(bands.filter(b => b.id !== id));
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        }
    };


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
                {currentBands.length > 0 ? (
                    currentBands.map((b) => (
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