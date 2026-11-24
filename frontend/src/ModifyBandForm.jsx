import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import { apiFetch } from "./api.js";

export default function ModifyBandForm({ bandId, onClose }) {
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

    const [fetchedAlbum, setFetchedAlbum] = useState(null);
    const [albumLookupError, setAlbumLookupError] = useState('');
    const [fetchedFrontman, setFetchedFrontman] = useState(null);
    const [frontmanLookupError, setFrontmanLookupError] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);

    const intFields = new Set([
        'numberOfParticipants',
        'singles',
        'albumsCount'
    ]);

    const idFields = new Set([
        'bestAlbumId',
        'frontManId'
    ]);

    const decimalFields = new Set([
        'coordinatesX',
        'coordinatesY'
    ]);

    useEffect(() => {
        if (!bandId) return;

        setLoading(true);
        apiFetch(`/bands/${bandId}`)
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
                    coordinatesX: data.coordinates?.x != null ? String(data.coordinates.x) : '',
                    coordinatesY: data.coordinates?.y != null ? String(data.coordinates.y) : '',
                    genre: data.genre || 'ROCK',
                    numberOfParticipants: data.numberOfParticipants != null ? String(data.numberOfParticipants) : '',
                    singles: data.singlesCount != null ? String(data.singlesCount) : '',
                    description: data.description || '',
                    albumsCount: data.albumsCount != null ? String(data.albumsCount) : '',
                    bestAlbumId: data.bestAlbum?.id != null ? String(data.bestAlbum.id) : '',
                    establishmentDate: formattedDate,
                    frontManId: data.frontMan?.id != null ? String(data.frontMan.id) : ''
                });
                setErrors({});
                setLoading(false);
            })
            .catch(err => {
                toast.error(err.message);
                setLoading(false);
            });
    }, [bandId]);

    useEffect(() => {
        if (formData.bestAlbumId && /^\d+$/.test(formData.bestAlbumId)) {
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
    }, [formData.bestAlbumId]);

    useEffect(() => {
        if (formData.frontManId && /^\d+$/.test(formData.frontManId)) {
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
    }, [formData.frontManId]);

    const CloseForm = () => {
        toast.info("Изменения не сохранены");
        onClose();
    };

    function handleIntKeyDown(e) {
        if (['-', '+', 'e', 'E', '.', ','].includes(e.key)) {
            e.preventDefault();
        }
    }

    function handleDecimalKeyDown(e) {
        if (['+', 'e', 'E'].includes(e.key)) {
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

        const albId = Number(data.bestAlbumId);
        if (!data.bestAlbumId || !Number.isInteger(albId) || albId <= 0) {
            nextErrors.bestAlbum = "Поле обязательно: укажите корректный ID альбома (больше 0)";
        } else if (albumLookupError) {
            nextErrors.bestAlbum = `Невозможно использовать альбом: ${albumLookupError}`;
        }

        const fmId = Number(data.frontManId);
        if (!data.frontManId || !Number.isInteger(fmId) || fmId <= 0) {
            nextErrors.frontMan = "Поле обязательно: укажите корректный ID фронтмена (больше 0)";
        } else if (frontmanLookupError) {
            nextErrors.frontMan = `Невозможно использовать фронтмена: ${frontmanLookupError}`;
        }

        return nextErrors;
    }

    function handleChange(e) {
        const { name, value } = e.target;

        if (intFields.has(name) || idFields.has(name)) {
            if (value !== '' && !/^\d+$/.test(value)) {
                return;
            }
        } else if (decimalFields.has(name)) {
            if (value !== '' && !/^-?\d*[.,]?\d*$/.test(value)) {
                return;
            }
        }

        const normalizedValue = decimalFields.has(name) ? value.replace(',', '.') : value;

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
                bestAlbum: { id: Number(formData.bestAlbumId) },
                frontMan: { id: Number(formData.frontManId) }
            };

            const response = await apiFetch(`/bands/${bandId}`, {
                method: 'PUT',
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

    if (loading) {
        return <div>Загрузка данных группы...</div>;
    }

    const hasErrors = Object.keys(errors).length > 0;

    return (
        <div>
            <div className="ModifyFormDiv">
                <h2>Изменить группу (ID: {bandId})</h2>
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
                    <label>ID лучшего альбома <span style={{ color: 'red' }}>*</span>:</label>
                    <input
                        type="text"
                        inputMode="numeric"
                        name="bestAlbumId"
                        value={formData.bestAlbumId}
                        onKeyDown={handleIntKeyDown}
                        onChange={handleChange}
                    />
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
                    <label>ID фронтмена <span style={{ color: 'red' }}>*</span>:</label>
                    <input
                        type="text"
                        inputMode="numeric"
                        name="frontManId"
                        value={formData.frontManId}
                        onKeyDown={handleIntKeyDown}
                        onChange={handleChange}
                    />
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
                            <p style={{ margin: '2px 0' }}>Рост: {fetchedFrontman.height}</p>
                            <p style={{ margin: '2px 0' }}>Паспорт ID: {fetchedFrontman.passportID}</p>
                        </div>
                    )}
                </div>
            </div>

            {hasErrors && (
                <div style={{ color: 'crimson', marginTop: '10px', fontSize: '13px' }}>
                    Сохранение заблокировано: исправьте выделенные поля.
                </div>
            )}

            <div style={{ marginTop: '10px' }}>
                <button type="button" onClick={SubmitGroup}>Подтвердить изменения</button>
            </div>
        </div>
    );
}