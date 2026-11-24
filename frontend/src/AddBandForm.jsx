import {toast} from "react-toastify";
import {useState, useEffect} from "react";

export default function AddBandForm({onClose}){
    const CloseForm = () => {
        toast.error("Данные не сохранены")
        onClose();
    }

    const [formData, setFormData] = useState({
        name: '',
        coordinatesX: '',
        coordinatesY: '',
        genre: 'ROCK',
        numberOfParticipants: '',
        singles: '',
        description: '',
        albumsCount: '',
        establishmentDate: '',

        createNewAlbum: false,
        bestAlbumId: '',

        newAlbumName: '',
        newAlbumTracks: '',
        newAlbumSales: '',

        createNewFrontman: false,
        frontManId: '',

        newPersonName: '',
        newPersonEyeColor: 'GREEN',
        newPersonHairColor: 'GREEN',
        newPersonHeight: '',
        newPersonPassportID: '',

        createNewLocation: false,
        locationId: '',
        newLocationX: '',
        newLocationY: '',
        newLocationZ: '',
        newLocationName: ''
    });


    const [fetchedAlbum, setFetchedAlbum] = useState(null);
    const [fetchedFrontman, setFetchedFrontman] = useState(null);


    useEffect(() => {
        if (!formData.createNewAlbum && formData.bestAlbumId) {
            fetch(`http://localhost:8080/is_lab1/albums/${formData.bestAlbumId}`)
                .then(res => res.ok ? res.json() : null)
                .then(data => setFetchedAlbum(data))
                .catch(() => setFetchedAlbum(null));
        } else {
            setFetchedAlbum(null);
        }
    }, [formData.createNewAlbum, formData.bestAlbumId]);


    useEffect(() => {
        if (!formData.createNewFrontman && formData.frontManId) {
            fetch(`http://localhost:8080/is_lab1/persons/${formData.frontManId}`)
                .then(res => res.ok ? res.json() : null)
                .then(data => setFetchedFrontman(data))
                .catch(() => setFetchedFrontman(null));
        } else {
            setFetchedFrontman(null);
        }
    }, [formData.createNewFrontman, formData.frontManId]);

    function handleChange(e) {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    }

    const SubmitGroup = async () => {
        try {
            let locationObj = null;
            if (formData.createNewFrontman) {
                if (formData.createNewLocation) {
                    locationObj = {
                        x: Number(formData.newLocationX),
                        y: Number(formData.newLocationY),
                        z: Number(formData.newLocationZ),
                        name: formData.newLocationName || null
                    };
                } else {
                    locationObj = { id: Number(formData.locationId) };
                }
            }

            const albumObj = formData.createNewAlbum
                ? {
                    name: formData.newAlbumName,
                    tracks: Number(formData.newAlbumTracks),
                    sales: Number(formData.newAlbumSales)
                }
                : { id: Number(formData.bestAlbumId) };

            const frontmanObj = formData.createNewFrontman
                ? {
                    name: formData.newPersonName,
                    eyeColor: formData.newPersonEyeColor || null,
                    hairColor: formData.newPersonHairColor || null,
                    height: Number(formData.newPersonHeight),
                    passportID: formData.newPersonPassportID,
                    location: locationObj
                }
                : { id: Number(formData.frontManId) };

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
                bestAlbum: albumObj,
                frontMan: frontmanObj
            };

            const response = await fetch('http://localhost:8080/is_lab1/bands', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(errText || 'Ошибка при сохранении');
            }

            toast.success("Группа успешно добавлена!");
            onClose();
        } catch (err) {
            toast.error(err.message);
        }
    };

    return(
        <div>
            <div>
                <h1>Добавить группу</h1>
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
                            type="text"
                            name="coordinatesX"
                            value={formData.coordinatesX}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label>Y:</label>
                        <input
                            type="text"
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
                    <div>
                        <label>Лучший альбом (Создать новый?):</label>
                        <input
                            type="checkbox"
                            name="createNewAlbum"
                            checked={formData.createNewAlbum}
                            onChange={handleChange}
                        />
                    </div>

                    {!formData.createNewAlbum ? (
                        <div>
                            <div>
                                <label>ID существующего альбома:</label>
                                <input
                                    type="number"
                                    name="bestAlbumId"
                                    value={formData.bestAlbumId}
                                    onChange={handleChange}
                                />
                            </div>

                            {fetchedAlbum && (
                                <div style={{ border: '1px dashed #666', padding: '8px', marginTop: '5px', background: '#f9f9f9' }}>
                                    <p style={{ margin: '2px 0', fontSize: '14px' }}><strong>Просмотр альбома:</strong></p>
                                    <p style={{ margin: '2px 0' }}>Название: {fetchedAlbum.name}</p>
                                    <p style={{ margin: '2px 0' }}>Треки: {fetchedAlbum.tracks}</p>
                                    <p style={{ margin: '2px 0' }}>Продажи: {fetchedAlbum.sales}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div>
                            <div>
                                <label>Название нового альбома:</label>
                                <input type="text" name="newAlbumName" value={formData.newAlbumName} onChange={handleChange} />
                            </div>
                            <div>
                                <label>Треки:</label>
                                <input type="number" name="newAlbumTracks" value={formData.newAlbumTracks} onChange={handleChange} />
                            </div>
                            <div>
                                <label>Продажи:</label>
                                <input type="number" name="newAlbumSales" value={formData.newAlbumSales} onChange={handleChange} />
                            </div>
                        </div>
                    )}
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
                    <div>
                        <label>Фронтмен (Создать нового?):</label>
                        <input
                            type="checkbox"
                            name="createNewFrontman"
                            checked={formData.createNewFrontman}
                            onChange={handleChange}
                        />
                    </div>

                    {!formData.createNewFrontman ? (
                        <div>
                            <div>
                                <label>ID существующего фронтмена:</label>
                                <input
                                    type="number"
                                    name="frontManId"
                                    value={formData.frontManId}
                                    onChange={handleChange}
                                />
                            </div>
                            {fetchedFrontman && (
                                <div style={{ border: '1px dashed #666', padding: '8px', marginTop: '5px', background: '#f9f9f9' }}>
                                    <p style={{ margin: '2px 0', fontSize: '14px' }}><strong>Просмотр фронтмена:</strong></p>
                                    <p style={{ margin: '2px 0' }}>Имя: {fetchedFrontman.name}</p>
                                    <p style={{ margin: '2px 0' }}>Цвет глаз: {fetchedFrontman.eyeColor || 'нет'}</p>
                                    <p style={{ margin: '2px 0' }}>Цвет волос: {fetchedFrontman.hairColor || 'нет'}</p>
                                    <p style={{ margin: '2px 0' }}>Рост: {fetchedFrontman.height}</p>
                                    <p style={{ margin: '2px 0' }}>Паспорт ID: {fetchedFrontman.passportID}</p>
                                    {fetchedFrontman.location && (
                                        <p style={{ margin: '2px 0' }}>
                                            Локация: {fetchedFrontman.location.name || 'Без названия'} (X: {fetchedFrontman.location.x}, Y: {fetchedFrontman.location.y}, Z: {fetchedFrontman.location.z})
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div>
                            <div>
                                <label>Имя фронтмена:</label>
                                <input type="text" name="newPersonName" value={formData.newPersonName} onChange={handleChange} />
                            </div>
                            <div>
                                <label>Цвет глаз:</label>
                                <select name="newPersonEyeColor" value={formData.newPersonEyeColor} onChange={handleChange}>
                                    <option value="GREEN">GREEN</option>
                                    <option value="RED">RED</option>
                                    <option value="BLACK">BLACK</option>
                                    <option value="BLUE">BLUE</option>
                                    <option value="BROWN">BROWN</option>
                                </select>
                            </div>
                            <div>
                                <label>Цвет волос:</label>
                                <select name="newPersonHairColor" value={formData.newPersonHairColor} onChange={handleChange}>
                                    <option value="GREEN">GREEN</option>
                                    <option value="RED">RED</option>
                                    <option value="BLACK">BLACK</option>
                                    <option value="BLUE">BLUE</option>
                                    <option value="BROWN">BROWN</option>
                                </select>
                            </div>
                            <div>
                                <label>Рост:</label>
                                <input type="number" name="newPersonHeight" value={formData.newPersonHeight} onChange={handleChange} />
                            </div>
                            <div>
                                <label>Паспорт ID:</label>
                                <input type="text" name="newPersonPassportID" value={formData.newPersonPassportID} onChange={handleChange} />
                            </div>


                            <div>
                                <label>Создать новую локацию?</label>
                                <input
                                    type="checkbox"
                                    name="createNewLocation"
                                    checked={formData.createNewLocation}
                                    onChange={handleChange}
                                />
                            </div>

                            {!formData.createNewLocation ? (
                                <div>
                                    <label>ID существующей локации:</label>
                                    <input type="number" name="locationId" value={formData.locationId} onChange={handleChange} />
                                </div>
                            ) : (
                                <div>
                                    <input type="number" name="newLocationX" placeholder="X" value={formData.newLocationX} onChange={handleChange} />
                                    <input type="number" name="newLocationY" placeholder="Y" value={formData.newLocationY} onChange={handleChange} />
                                    <input type="number" name="newLocationZ" placeholder="Z" value={formData.newLocationZ} onChange={handleChange} />
                                    <input type="text" name="newLocationName" placeholder="Название локации" value={formData.newLocationName} onChange={handleChange} />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <div>
                <button onClick={SubmitGroup}>Добавить</button>
            </div>
        </div>
    );
}