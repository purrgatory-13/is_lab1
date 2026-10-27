import {toast} from "react-toastify";
import {useState, useEffect} from "react";

export default function ModifyBandForm({bandId, onClose}){
    const [formData, setFormData] = useState({
        name: '',
        coordinatesX: '',
        coordinatesY: '',
        genre: 'ROCK',
        numberOfParticipants: '',
        singles: '',
        description: '',
        albumsCount: '',
        bestAlbumId: '',
        establishmentDate: '',
        frontManId: ''
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!bandId) return;

        fetch(`http://localhost:8080/is_lab1/bands/${bandId}`)
            .then(res => {
                if (!res.ok) throw new Error("Не удалось загрузить данные группы");
                return res.json();
            })
            .then(data => {
                let formattedDate = '';
                if (data.establishmentDate) {
                    formattedDate = data.establishmentDate.split('T')[0];
                }

                setFormData({
                    name: data.name || '',
                    coordinatesX: data.coordinates?.x ?? '',
                    coordinatesY: data.coordinates?.y ?? '',
                    genre: data.genre || 'ROCK',
                    numberOfParticipants: data.numberOfParticipants ?? '',
                    singles: data.singlesCount ?? '',
                    description: data.description || '',
                    albumsCount: data.albumsCount ?? '',
                    bestAlbumId: data.bestAlbum?.id || '',
                    establishmentDate: formattedDate,
                    frontManId: data.frontMan?.id || ''
                });
                setLoading(false);
            })
            .catch(err => {
                toast.error(err.message);
                setLoading(false);
            });
    }, [bandId]);

    const CloseForm = () => {
        toast.info("Изменения не сохранены");
        onClose();
    };

    const SubmitGroup = async () => {
        try {
            const payload = {
                name: formData.name,
                coordinates: {
                    x: Number(formData.coordinatesX),
                    y: Number(formData.coordinatesY)
                },
                genre: formData.genre,
                numberOfParticipants: formData.numberOfParticipants ? Number(formData.numberOfParticipants) : null,
                singlesCount: formData.singles ? Number(formData.singles) : null,
                description: formData.description,
                albumsCount: Number(formData.albumsCount),
                establishmentDate: new Date(formData.establishmentDate).toISOString(),
                bestAlbum: { id: Number(formData.bestAlbumId) },
                frontMan: { id: Number(formData.frontManId) }
            };

            const response = await fetch(`http://localhost:8080/is_lab1/bands/${bandId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(errText || 'Ошибка при обновлении');
            }

            toast.success("Группа успешно изменена!");
            onClose();
        } catch (err) {
            toast.error(err.message);
        }
    };

    function handleChange(e) {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    }

    if (loading) {
        return <div>Загрузка данных группы...</div>;
    }

    return (
        <div>
            <div className="ModifyFormDiv">
                <h2>Изменить группу (ID: {bandId})</h2>
                <button onClick={CloseForm}>Закрыть</button>
                <div>
                    <label>Название:</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <div>
                        <label>X:</label>
                        <input
                            type="number"
                            name="coordinatesX"
                            value={formData.coordinatesX}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label>Y:</label>
                        <input
                            type="number"
                            name="coordinatesY"
                            value={formData.coordinatesY}
                            onChange={handleChange}
                        />
                    </div>
                </div>
                <div>
                    <label>Жанр:</label>
                    <select
                        name="genre"
                        value={formData.genre}
                        onChange={handleChange}>
                        <option value="ROCK">ROCK</option>
                        <option value="PROGRESSIVE_ROCK">PROGRESSIVE_ROCK</option>
                        <option value="RAP">RAP</option>
                        <option value="POST_ROCK">POST_ROCK</option>
                    </select>
                </div>
                <div>
                    <label>Участники:</label>
                    <input
                        type="number"
                        name="numberOfParticipants"
                        value={formData.numberOfParticipants}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Синглы:</label>
                    <input
                        type="number"
                        name="singles"
                        value={formData.singles}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Описание:</label>
                    <input
                        type="text"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Альбомы:</label>
                    <input
                        type="number"
                        name="albumsCount"
                        value={formData.albumsCount}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>ID лучшего альбома:</label>
                    <input
                        type="number"
                        name="bestAlbumId"
                        value={formData.bestAlbumId}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Дата основания:</label>
                    <input
                        type="date"
                        name="establishmentDate"
                        value={formData.establishmentDate}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>ID фронтмена:</label>
                    <input
                        type="number"
                        name="frontManId"
                        value={formData.frontManId}
                        onChange={handleChange}
                    />
                </div>
            </div>
            <div>
                <button onClick={SubmitGroup}>Подтвердить изменения</button>
            </div>
        </div>
    );
}