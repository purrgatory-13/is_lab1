import {toast} from 'react-toastify';
import { useState, useEffect } from 'react';

export default function AlbumTable({ onOpenAddAlbumForm, onOpenModifyAlbumForm }) {

    const [albums, setAlbums] = useState([]);
    const [searchId, setSearchId] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    // Состояния для пагинации
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5; // Количество элементов на странице

    const fetchAlbums = () => {
        if (isSearching) return;

        fetch('http://localhost:8080/is_lab1/albums')
            .then(response => {
                if (!response.ok) {
                    throw new Error("Server Error")
                }
                return response.json();
            })
            .then(data => {
                const sorted = [...data].sort((a, b) => a.id - b.id);
                setAlbums(sorted);
            })
            .catch(error => {
                console.error("Не удалось загрузить альбомы:", error);
            });
    };

    useEffect(() => {
        fetchAlbums();
        const interval = setInterval(fetchAlbums, 3000);
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

        fetch(`http://localhost:8080/is_lab1/albums/${searchId}`)
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
                const sorted = [...results].sort((a, b) => a.id - b.id);
                setAlbums(sorted);
                toast.success(`Найден альбом с ID: ${searchId}`);
            })
            .catch(error => {
                console.error(error);
                toast.error(error.message);
                setAlbums([]);
            });
    };

    const handleResetSearch = () => {
        setSearchId('');
        setIsSearching(false);
        setCurrentPage(1);
        fetchAlbums();
    };

    const handleDeleteAlbum = async (id) => {
        if (!window.confirm(`Точно удалить альбом с ID ${id}?`)) return;

        try {
            const response = await fetch(`http://localhost:8080/is_lab1/albums/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(errText || "Не удалось удалить альбом");
            }

            toast.success(`Альбом с ID ${id} удален`);
            setAlbums(albums.filter(a => a.id !== id));
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


    const totalPages = Math.ceil(albums.length / pageSize) || 1;
    const indexOfLastItem = currentPage * pageSize;
    const indexOfFirstItem = indexOfLastItem - pageSize;
    const currentAlbums = albums.slice(indexOfFirstItem, indexOfLastItem);

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    return (
        <div>
            <h1>Список альбомов</h1>

            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
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
                {currentAlbums.length > 0 ? (
                    currentAlbums.map((a)=>(
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