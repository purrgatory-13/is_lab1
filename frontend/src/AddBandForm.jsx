import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import { apiFetch } from "./api.js";

export default function AddBandForm({ onClose }) {
    const CloseForm = () => {
        toast.error("Данные не сохранены");
        onClose();
    };

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
    const [albumLookupError, setAlbumLookupError] = useState('');
    const [fetchedFrontman, setFetchedFrontman] = useState(null);
    const [frontmanLookupError, setFrontmanLookupError] = useState('');
    const [errors, setErrors] = useState({});

    const intFields = new Set([
        'numberOfParticipants',
        'singles',
        'albumsCount',
        'newAlbumTracks',
        'newPersonHeight'
    ]);

    const idFields = new Set([
        'bestAlbumId',
        'frontManId',
        'locationId'
    ]);

    const decimalNonNegFields = new Set([
        'coordinatesX',
        'coordinatesY',
        'newAlbumSales',
        'newLocationX',
        'newLocationY',
        'newLocationZ'
    ]);

    useEffect(() => {
        if (!formData.createNewAlbum && formData.bestAlbumId) {
            setAlbumLookupError('');
            apiFetch(`/albums/${formData.bestAlbumId}`)
                .then(async res => {
                    if (!res.ok) {
                        const txt = await res.text().catch(() => '');
                        throw new Error(txt || "Альбом с таким ID не найден");
                    }
                    return res.json();
                })
                .then(data => {
                    setFetchedAlbum(data);
                    setAlbumLookupError('');
                })
                .catch(err => {
                    setFetchedAlbum(null);
                    setAlbumLookupError(err.message);
                });
        } else {
            setFetchedAlbum(null);
            setAlbumLookupError('');
        }
    }, [formData.createNewAlbum, formData.bestAlbumId]);

    useEffect(() => {
        if (!formData.createNewFrontman && formData.frontManId) {
            setFrontmanLookupError('');
            apiFetch(`/person/${formData.frontManId}`)
                .then(async res => {
                    if (!res.ok) {
                        const txt = await res.text().catch(() => '');
                        throw new Error(txt || "Фронтмен с таким ID не найден");
                    }
                    return res.json();
                })
                .then(data => {
                    setFetchedFrontman(data);
                    setFrontmanLookupError('');
                })
                .catch(err => {
                    setFetchedFrontman(null);
                    setFrontmanLookupError(err.message);
                });
        } else {
            setFetchedFrontman(null);
            setFrontmanLookupError('');
        }
    }, [formData.createNewFrontman, formData.frontManId]);

    function handleIntKeyDown(e) {
        if (['-', '+', 'e', 'E', '.', ','].includes(e.key)) {
            e.preventDefault();
        }
    }

    function handleDecimalKeyDown(e) {
        if (['-', '+', 'e', 'E'].includes(e.key)) {
            e.preventDefault();
        }
    }

    function validate(data) {
        const nextErrors = {};

        if (!data.name || !data.name.trim()) {
            nextErrors.name = "Поле обязательно: введите название группы (не может быть пустым)";
        }

        if (data.coordinatesX === '' || !Number.isFinite(Number(data.coordinatesX))) {
            nextErrors.coordinatesX = "Поле обязательно: укажите числовую координату X";
        }
        if (data.coordinatesY === '' || !Number.isFinite(Number(data.coordinatesY))) {
            nextErrors.coordinatesY = "Поле обязательно: укажите числовую координату Y";
        }

        if (data.numberOfParticipants !== '') {
            const participants = Number(data.numberOfParticipants);
            if (!Number.isInteger(participants) || participants <= 0) {
                nextErrors.numberOfParticipants = "Недопустимое значение: если число участников указано, оно должно быть больше 0";
            }
        }

        if (data.singles !== '') {
            const singles = Number(data.singles);
            if (!Number.isInteger(singles) || singles < 0) {
                nextErrors.singles = "Недопустимое значение: число синглов не может быть отрицательным";
            }
        }

        if (data.albumsCount === '') {
            nextErrors.albumsCount = "Поле обязательно: укажите число альбомов";
        } else {
            const albums = Number(data.albumsCount);
            if (!Number.isInteger(albums) || albums <= 0) {
                nextErrors.albumsCount = "Недопустимое значение: число альбомов должно быть больше 0";
            }
        }

        if (!data.establishmentDate) {
            nextErrors.establishmentDate = "Поле обязательно: выберите дату основания";
        }

        if (!data.createNewAlbum) {
            const albId = Number(data.bestAlbumId);
            if (!data.bestAlbumId || !Number.isInteger(albId) || albId <= 0) {
                nextErrors.bestAlbum = "Поле обязательно: выберите существующий альбом (ID больше 0) или создайте новый";
            } else if (albumLookupError) {
                nextErrors.bestAlbum = `Невозможно использовать альбом: ${albumLookupError}`;
            }
        } else {
            if (!data.newAlbumName || !data.newAlbumName.trim()) {
                nextErrors.newAlbumName = "Поле обязательно: укажите название нового альбома";
            }
            const tracks = Number(data.newAlbumTracks);
            if (data.newAlbumTracks === '' || !Number.isInteger(tracks) || tracks <= 0) {
                nextErrors.newAlbumTracks = "Поле обязательно: количество треков должно быть больше 0";
            }
            const sales = Number(data.newAlbumSales);
            if (data.newAlbumSales === '' || !Number.isFinite(sales) || sales <= 0) {
                nextErrors.newAlbumSales = "Поле обязательно: продажи должны быть больше 0";
            }
        }

        if (!data.createNewFrontman) {
            const fmId = Number(data.frontManId);
            if (!data.frontManId || !Number.isInteger(fmId) || fmId <= 0) {
                nextErrors.frontMan = "Поле обязательно: укажите ID фронтмена (больше 0) или создайте нового";
            } else if (frontmanLookupError) {
                nextErrors.frontMan = `Невозможно использовать фронтмена: ${frontmanLookupError}`;
            }
        } else {
            if (!data.newPersonName || !data.newPersonName.trim()) {
                nextErrors.newPersonName = "Поле обязательно: укажите имя фронтмена";
            }
            const height = Number(data.newPersonHeight);
            if (data.newPersonHeight === '' || !Number.isInteger(height) || height <= 0) {
                nextErrors.newPersonHeight = "Поле обязательно: рост должен быть больше 0";
            }
            if (!data.newPersonPassportID || !data.newPersonPassportID.trim()) {
                nextErrors.newPersonPassportID = "Поле обязательно: укажите Паспорт ID фронтмена";
            }
            if (data.createNewLocation) {
                if (data.newLocationX === '' || !Number.isFinite(Number(data.newLocationX))) {
                    nextErrors.newLocationX = "Поле обязательно: укажите координату X";
                }
                if (data.newLocationY === '' || !Number.isFinite(Number(data.newLocationY))) {
                    nextErrors.newLocationY = "Поле обязательно: укажите координату Y";
                }
                if (data.newLocationZ === '' || !Number.isFinite(Number(data.newLocationZ))) {
                    nextErrors.newLocationZ = "Поле обязательно: укажите координату Z";
                }
            } else {
                const locId = Number(data.locationId);
                if (!data.locationId || !Number.isInteger(locId) || locId <= 0) {
                    nextErrors.locationId = "Поле обязательно: укажите ID локации (больше 0)";
                }
            }
        }

        return nextErrors;
    }

    function handleChange(e) {
        const { name, value, type, checked } = e.target;

        if (type !== 'checkbox') {
            if (intFields.has(name) || idFields.has(name)) {
                if (value !== '' && !/^\d+$/.test(value)) {
                    return;
                }
            } else if (decimalNonNegFields.has(name)) {
                if (value !== '' && !/^\d*[.,]?\d*$/.test(value)) {
                    return;
                }
            }
        }

        const normalizedValue = type === 'checkbox'
            ? checked
            : (decimalNonNegFields.has(name) ? value.replace(',', '.') : value);

        setFormData(prev => ({
            ...prev,
            [name]: normalizedValue
        }));

        if (errors[name]) {
            setErrors(prev => {
                const copy = { ...prev };
                delete copy[name];
                return copy;
            });
        }
        if (name === 'bestAlbumId' && errors.bestAlbum) {
            setErrors(prev => {
                const copy = { ...prev };
                delete copy.bestAlbum;
                return copy;
            });
        }
        if (name === 'frontManId' && errors.frontMan) {
            setErrors(prev => {
                const copy = { ...prev };
                delete copy.frontMan;
                return copy;
            });
        }
    }

    const SubmitGroup = async () => {
        const nextErrors = validate(formData);
        if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors);
            toast.warn("Проверьте обязательные поля и корректность данных");
            return;
        }

        try {
            let locationObj = null;
            if (formData.createNewFrontman) {
                if (formData.createNewLocation) {
                    locationObj = {
                        x: Number(formData.newLocationX),
                        y: Number(formData.newLocationY),
                        z: Number(formData.newLocationZ),
                        name: formData.newLocationName.trim() || null
                    };
                } else {
                    locationObj = { id: Number(formData.locationId) };
                }
            }

            const albumObj = formData.createNewAlbum
                ? {
                    name: formData.newAlbumName.trim(),
                    tracks: Number(formData.newAlbumTracks),
                    sales: Number(formData.newAlbumSales)
                }
                : { id: Number(formData.bestAlbumId) };

            const frontmanObj = formData.createNewFrontman
                ? {
                    name: formData.newPersonName.trim(),
                    eyeColor: formData.newPersonEyeColor || null,
                    hairColor: formData.newPersonHairColor || null,
                    height: Number(formData.newPersonHeight),
                    passportID: formData.newPersonPassportID.trim(),
                    location: locationObj
                }
                : { id: Number(formData.frontManId) };

            const payload = {
                name: formData.name.trim(),
                coordinates: {
                    x: Number(formData.coordinatesX),
                    y: Number(formData.coordinatesY)
                },
                genre: formData.genre,
                numberOfParticipants: formData.numberOfParticipants !== '' ? Number(formData.numberOfParticipants) : null,
                singlesCount: formData.singles !== '' ? Number(formData.singles) : null,
                description: formData.description,
                albumsCount: Number(formData.albumsCount),
                establishmentDate: new Date(formData.establishmentDate).toISOString(),
                bestAlbum: albumObj,
                frontMan: frontmanObj
            };

            const response = await apiFetch('/bands', {
                method: 'POST',
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

    const hasErrors = Object.keys(errors).length > 0;

    return (
        <div>
            <div>
                <h1>Добавить группу</h1>
                <p style={{ fontSize: '13px', color: '#666' }}>
                    Поля со звёздочкой (<strong>*</strong>) обязательны. Число участников необязательно, но если указано — должно быть больше 0.
                </p>
                <button type="button" onClick={CloseForm}>Закрыть</button>

                <div>
                    <label>Название <span style={{ color: 'red' }}>*</span>:</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                    />
                    {errors.name && (
                        <div style={{ color: 'crimson', fontSize: '13px' }}>{errors.name}</div>
                    )}
                </div>

                <div>
                    <div>
                        <label>X <span style={{ color: 'red' }}>*</span>:</label>
                        <input
                            type="text"
                            inputMode="decimal"
                            name="coordinatesX"
                            value={formData.coordinatesX}
                            onKeyDown={handleDecimalKeyDown}
                            onChange={handleChange}
                        />
                        {errors.coordinatesX && (
                            <div style={{ color: 'crimson', fontSize: '13px' }}>{errors.coordinatesX}</div>
                        )}
                    </div>
                    <div>
                        <label>Y <span style={{ color: 'red' }}>*</span>:</label>
                        <input
                            type="text"
                            inputMode="decimal"
                            name="coordinatesY"
                            value={formData.coordinatesY}
                            onKeyDown={handleDecimalKeyDown}
                            onChange={handleChange}
                        />
                        {errors.coordinatesY && (
                            <div style={{ color: 'crimson', fontSize: '13px' }}>{errors.coordinatesY}</div>
                        )}
                    </div>
                </div>

                <div>
                    <label>Жанр <span style={{ color: 'red' }}>*</span>:</label>
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
                    <label>Участники (необязательно, но больше 0):</label>
                    <input
                        type="text"
                        inputMode="numeric"
                        name="numberOfParticipants"
                        value={formData.numberOfParticipants}
                        onKeyDown={handleIntKeyDown}
                        onChange={handleChange}
                    />
                    {errors.numberOfParticipants && (
                        <div style={{ color: 'crimson', fontSize: '13px' }}>{errors.numberOfParticipants}</div>
                    )}
                </div>

                <div>
                    <label>Синглы:</label>
                    <input
                        type="text"
                        inputMode="numeric"
                        name="singles"
                        value={formData.singles}
                        onKeyDown={handleIntKeyDown}
                        onChange={handleChange}
                    />
                    {errors.singles && (
                        <div style={{ color: 'crimson', fontSize: '13px' }}>{errors.singles}</div>
                    )}
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
                    <label>Альбомы <span style={{ color: 'red' }}>*</span>:</label>
                    <input
                        type="text"
                        inputMode="numeric"
                        name="albumsCount"
                        value={formData.albumsCount}
                        onKeyDown={handleIntKeyDown}
                        onChange={handleChange}
                    />
                    {errors.albumsCount && (
                        <div style={{ color: 'crimson', fontSize: '13px' }}>{errors.albumsCount}</div>
                    )}
                </div>

                <div>
                    <div>
                        <label>Лучший альбом <span style={{ color: 'red' }}>*</span> (Создать новый?):</label>
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
                                <label>ID существующего альбома <span style={{ color: 'red' }}>*</span>:</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    name="bestAlbumId"
                                    value={formData.bestAlbumId}
                                    onKeyDown={handleIntKeyDown}
                                    onChange={handleChange}
                                />
                            </div>
                            {errors.bestAlbum && (
                                <div style={{ color: 'crimson', fontSize: '13px' }}>{errors.bestAlbum}</div>
                            )}
                            {!errors.bestAlbum && albumLookupError && (
                                <div style={{ color: 'crimson', fontSize: '13px' }}>{albumLookupError}</div>
                            )}

                            {fetchedAlbum && (
                                <div>
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
                                <label>Название нового альбома <span style={{ color: 'red' }}>*</span>:</label>
                                <input type="text" name="newAlbumName" value={formData.newAlbumName} onChange={handleChange} />
                                {errors.newAlbumName && (
                                    <div style={{ color: 'crimson', fontSize: '13px' }}>{errors.newAlbumName}</div>
                                )}
                            </div>
                            <div>
                                <label>Треки <span style={{ color: 'red' }}>*</span>:</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    name="newAlbumTracks"
                                    value={formData.newAlbumTracks}
                                    onKeyDown={handleIntKeyDown}
                                    onChange={handleChange}
                                />
                                {errors.newAlbumTracks && (
                                    <div style={{ color: 'crimson', fontSize: '13px' }}>{errors.newAlbumTracks}</div>
                                )}
                            </div>
                            <div>
                                <label>Продажи <span style={{ color: 'red' }}>*</span>:</label>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    name="newAlbumSales"
                                    value={formData.newAlbumSales}
                                    onKeyDown={handleDecimalKeyDown}
                                    onChange={handleChange}
                                />
                                {errors.newAlbumSales && (
                                    <div style={{ color: 'crimson', fontSize: '13px' }}>{errors.newAlbumSales}</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div>
                    <label>Дата основания <span style={{ color: 'red' }}>*</span>:</label>
                    <input
                        type="date"
                        name="establishmentDate"
                        value={formData.establishmentDate}
                        onChange={handleChange}
                    />
                    {errors.establishmentDate && (
                        <div style={{ color: 'crimson', fontSize: '13px' }}>{errors.establishmentDate}</div>
                    )}
                </div>

                <div>
                    <div>
                        <label>Фронтмен <span style={{ color: 'red' }}>*</span> (Создать нового?):</label>
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
                                <label>ID существующего фронтмена <span style={{ color: 'red' }}>*</span>:</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    name="frontManId"
                                    value={formData.frontManId}
                                    onKeyDown={handleIntKeyDown}
                                    onChange={handleChange}
                                />
                            </div>
                            {errors.frontMan && (
                                <div style={{ color: 'crimson', fontSize: '13px' }}>{errors.frontMan}</div>
                            )}
                            {!errors.frontMan && frontmanLookupError && (
                                <div style={{ color: 'crimson', fontSize: '13px' }}>{frontmanLookupError}</div>
                            )}
                            {fetchedFrontman && (
                                <div>
                                    <p style={{ margin: '2px 0', fontSize: '14px' }}><strong>Просмотр фронтмена:</strong></p>
                                    <p style={{ margin: '2px 0' }}>Имя: {fetchedFrontman.name}</p>
                                    <p style={{ margin: '2px 0' }}>Цвет глаз: {fetchedFrontman.eyeColor || 'нет'}</p>
                                    <p style={{ margin: '2px 0' }}>Цвет волос: {fetchedFrontman.hairColor || 'нет'}</p>
                                    <p style={{ margin: '2px 0' }}>Рост: {fetchedFrontman.height}</p>
                                    <p style={{ margin: '2px 0' }}>Паспорт ID: {fetchedFrontman.passportID || 'нет'}</p>
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
                                <label>Имя фронтмена <span style={{ color: 'red' }}>*</span>:</label>
                                <input type="text" name="newPersonName" value={formData.newPersonName} onChange={handleChange} />
                                {errors.newPersonName && (
                                    <div style={{ color: 'crimson', fontSize: '13px' }}>{errors.newPersonName}</div>
                                )}
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
                                <label>Рост <span style={{ color: 'red' }}>*</span>:</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    name="newPersonHeight"
                                    value={formData.newPersonHeight}
                                    onKeyDown={handleIntKeyDown}
                                    onChange={handleChange}
                                />
                                {errors.newPersonHeight && (
                                    <div style={{ color: 'crimson', fontSize: '13px' }}>{errors.newPersonHeight}</div>
                                )}
                            </div>
                            <div>
                                <label>Паспорт ID <span style={{ color: 'red' }}>*</span>:</label>
                                <input type="text" name="newPersonPassportID" value={formData.newPersonPassportID} onChange={handleChange} />
                                {errors.newPersonPassportID && (
                                    <div style={{ color: 'crimson', fontSize: '13px' }}>{errors.newPersonPassportID}</div>
                                )}
                            </div>

                            <div>
                                <label>Создать новую локацию? <span style={{ color: 'red' }}>*</span>:</label>
                                <input
                                    type="checkbox"
                                    name="createNewLocation"
                                    checked={formData.createNewLocation}
                                    onChange={handleChange}
                                />
                            </div>

                            {!formData.createNewLocation ? (
                                <div>
                                    <label>ID существующей локации <span style={{ color: 'red' }}>*</span>:</label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        name="locationId"
                                        value={formData.locationId}
                                        onKeyDown={handleIntKeyDown}
                                        onChange={handleChange}
                                    />
                                    {errors.locationId && (
                                        <div style={{ color: 'crimson', fontSize: '13px' }}>{errors.locationId}</div>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        name="newLocationX"
                                        placeholder="X *"
                                        value={formData.newLocationX}
                                        onKeyDown={handleDecimalKeyDown}
                                        onChange={handleChange}
                                    />
                                    {errors.newLocationX && (
                                        <div style={{ color: 'crimson', fontSize: '13px' }}>{errors.newLocationX}</div>
                                    )}
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        name="newLocationY"
                                        placeholder="Y *"
                                        value={formData.newLocationY}
                                        onKeyDown={handleDecimalKeyDown}
                                        onChange={handleChange}
                                    />
                                    {errors.newLocationY && (
                                        <div style={{ color: 'crimson', fontSize: '13px' }}>{errors.newLocationY}</div>
                                    )}
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        name="newLocationZ"
                                        placeholder="Z *"
                                        value={formData.newLocationZ}
                                        onKeyDown={handleDecimalKeyDown}
                                        onChange={handleChange}
                                    />
                                    {errors.newLocationZ && (
                                        <div style={{ color: 'crimson', fontSize: '13px' }}>{errors.newLocationZ}</div>
                                    )}
                                    <input
                                        type="text"
                                        name="newLocationName"
                                        placeholder="Название локации (необязательно)"
                                        value={formData.newLocationName}
                                        onChange={handleChange}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {hasErrors && (
                <div style={{ color: 'crimson', marginTop: '10px', fontSize: '13px' }}>
                    Сохранение заблокировано: есть обязательные незаполненные или некорректные поля.
                </div>
            )}

            <div style={{ marginTop: '10px' }}>
                <button type="button" onClick={SubmitGroup}>Добавить</button>
            </div>
        </div>
    );
}