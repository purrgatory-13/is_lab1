import {toast} from 'react-toastify';
import { useState, useEffect } from 'react';

export default function PersonTable({ onOpenAddPersonForm, onOpenModifyPersonForm }) {

    const [persons, setPersons] = useState([]);
    const [searchId, setSearchId] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

    const fetchPersons = () => {
        if (isSearching) return;

        fetch('http://localhost:8080/is_lab1/person')
            .then(response => {
                if (!response.ok) {
                    throw new Error("Server Error")
                }
                return response.json();
            })
            .then(data => {
                const sorted = [...data].sort((a, b) => a.id - b.id);
                setPersons(sorted);
            })
            .catch(error => {
                console.error("Не удалось загрузить персон:", error);
            });
    };

    useEffect(() => {
        fetchPersons();
        const interval = setInterval(fetchPersons, 3000);
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

        fetch(`http://localhost:8080/is_lab1/person/${searchId}`)
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
                const sorted = [...results].sort((a, b) => a.id - b.id);
                setPersons(sorted);
                toast.success(`Найдена персона с ID: ${searchId}`);
            })
            .catch(error => {
                console.error(error);
                toast.error(error.message);
                setPersons([]);
            });
    };

    const handleResetSearch = () => {
        setSearchId('');
        setIsSearching(false);
        setCurrentPage(1);
        fetchPersons();
    };

    const handleDeletePerson = async (id) => {
        if (!window.confirm(`Точно удалить персону с ID ${id}?`)) return;

        try {
            const response = await fetch(`http://localhost:8080/is_lab1/person/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(errText || "Не удалось удалить персону");
            }

            toast.success(`Персона с ID ${id} удалена`);
            setPersons(persons.filter(p => p.id !== id));
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

    const totalPages = Math.ceil(persons.length / pageSize) || 1;
    const indexOfLastItem = currentPage * pageSize;
    const indexOfFirstItem = indexOfLastItem - pageSize;
    const currentPersons = persons.slice(indexOfFirstItem, indexOfLastItem);

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    return (
        <div>
            <h1>Список персон</h1>

            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
                <button type="button" onClick={addPersonButton}>Добавить персону</button>

                <form onSubmit={handleSearchById} style={{ display: 'flex', gap: '5px' }}>
                    <input
                        type="number"
                        placeholder="Введите ID персоны"
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
                {currentPersons.length > 0 ? (
                    currentPersons.map((p)=>(
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