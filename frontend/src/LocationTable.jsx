import {toast} from 'react-toastify';
import { useState, useEffect } from 'react';

export default function LocationTable({ onOpenAddLocationForm, onOpenModifyLocationForm }) {

    const [locations, setLocations] = useState([]);
    const [searchId, setSearchId] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

    const fetchLocations = () => {
        if (isSearching) return;

        fetch('http://localhost:8080/is_lab1/locations')
            .then(response => {
                if (!response.ok) {
                    throw new Error("Server Error")
                }
                return response.json();
            })
            .then(data => {
                const sorted = [...data].sort((a, b) => a.id - b.id);
                setLocations(sorted);
            })
            .catch(error => {
                console.error("Не удалось загрузить локации:", error);
            });
    };

    useEffect(() => {
        fetchLocations();
        const interval = setInterval(fetchLocations, 3000);
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
                const sorted = [...results].sort((a, b) => a.id - b.id);
                setLocations(sorted);
                toast.success(`Найдена локация с ID: ${searchId}`);
            })
            .catch(error => {
                console.error(error);
                toast.error(error.message);
                setLocations([]);
            });
    };

    const handleResetSearch = () => {
        setSearchId('');
        setIsSearching(false);
        setCurrentPage(1);
        fetchLocations();
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
            setLocations(locations.filter(l => l.id !== id));
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

    const totalPages = Math.ceil(locations.length / pageSize) || 1;
    const indexOfLastItem = currentPage * pageSize;
    const indexOfFirstItem = indexOfLastItem - pageSize;
    const currentLocations = locations.slice(indexOfFirstItem, indexOfLastItem);

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    return (
        <div>
            <h1>Список локаций</h1>

            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
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
                {currentLocations.length > 0 ? (
                    currentLocations.map((l)=>(
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