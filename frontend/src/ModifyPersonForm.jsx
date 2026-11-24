import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import { apiFetch } from "./api.js";

export default function ModifyPersonForm({ personId, onClose }) {
    const [formData, setFormData] = useState({
        name: '',
        eyeColor: 'GREEN',
        hairColor: 'GREEN',
        height: '',
        passportID: '',

        createNewLocation: false,
        locationId: '',
        newLocationX: '',
        newLocationY: '',
        newLocationZ: '',
        newLocationName: ''
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!personId) return;

        setLoading(true);
        apiFetch(`/person/${personId}`)
            .then(res => {
                if (!res.ok) throw new Error("Не удалось загрузить данные персоны");
                return res.json();
            })
            .then(data => {
                setFormData({
                    name: data.name || '',
                    eyeColor: data.eyeColor || 'GREEN',
                    hairColor: data.hairColor || 'GREEN',
                    height: data.height != null ? String(data.height) : '',
                    passportID: data.passportID || '',

                    createNewLocation: false,
                    locationId: data.location?.id != null ? String(data.location.id) : '',
                    newLocationX: '',
                    newLocationY: '',
                    newLocationZ: '',
                    newLocationName: ''
                });
                setErrors({});
                setLoading(false);
            })
            .catch(err => {
                toast.error(err.message);
                setLoading(false);
            });
    }, [personId]);

    const CloseForm = () => {
        toast.info("Изменения не сохранены");
        onClose();
    };

    function validate(data) {
        const nextErrors = {};

        if (!data.name || !data.name.trim()) {
            nextErrors.name = "Поле обязательно: укажите имя персоны";
        }

        if (data.height === '' || data.height === null || data.height === undefined) {
            nextErrors.height = "Поле обязательно: укажите рост";
        } else {
            const h = Number(data.height);
            if (!Number.isFinite(h) || h <= 0) {
                nextErrors.height = "Недопустимое значение: рост должен быть больше 0";
            }
        }

        if (!data.passportID || !data.passportID.trim()) {
            nextErrors.passportID = "Поле обязательно: укажите Паспорт ID";
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
                nextErrors.locationId = "Поле обязательно: укажите корректный ID локации (больше 0)";
            }
        }

        return nextErrors;
    }

    function handleHeightKeyDown(e) {
        if (['-', '+', 'e', 'E', '.'].includes(e.key)) {
            e.preventDefault();
        }
    }

    function handleChange(e) {
        const { name, value, type, checked } = e.target;

        if (name === 'height' && type !== 'checkbox') {
            if (value !== '' && !/^\d+$/.test(value)) {
                return;
            }
        }

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        if (errors[name] || name === 'createNewLocation') {
            setErrors(prev => {
                const copy = { ...prev };
                delete copy[name];
                if (name === 'createNewLocation') {
                    delete copy.locationId;
                    delete copy.newLocationX;
                    delete copy.newLocationY;
                    delete copy.newLocationZ;
                }
                return copy;
            });
        }
    }

    const SubmitPerson = async () => {
        const nextErrors = validate(formData);
        if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors);
            toast.warn("Проверьте обязательные поля и корректность данных");
            return;
        }

        try {
            const locationObj = formData.createNewLocation
                ? {
                    x: Number(formData.newLocationX),
                    y: Number(formData.newLocationY),
                    z: Number(formData.newLocationZ),
                    name: formData.newLocationName.trim() || null
                }
                : { id: Number(formData.locationId) };

            const payload = {
                name: formData.name.trim(),
                eyeColor: formData.eyeColor || null,
                hairColor: formData.hairColor || null,
                height: Number(formData.height),
                passportID: formData.passportID.trim(),
                location: locationObj
            };

            const response = await apiFetch(`/person/${personId}`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(errText || 'Ошибка при обновлении персоны');
            }

            toast.success("Персона успешно изменена!");
            onClose();
        } catch (err) {
            toast.error(err.message);
        }
    };

    if (loading) {
        return <div>Загрузка данных персоны...</div>;
    }

    const hasErrors = Object.keys(errors).length > 0;

    return (
        <div style={{ padding: '20px', margin: '20px 0', display: 'inline-block' }}>
            <div className="ModifyFormDiv">
                <h2>Изменить персону (ID: {personId})</h2>
                <p style={{ fontSize: '13px', color: '#666' }}>
                    Поля со звёздочкой (<strong>*</strong>) обязательны для заполнения.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '350px', marginBottom: '15px' }}>
                    <div>
                        <label>Имя <span style={{ color: 'red' }}>*</span>: </label>
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
                        <label>Цвет глаз: </label>
                        <select name="eyeColor" value={formData.eyeColor} onChange={handleChange}>
                            <option value="GREEN">GREEN</option>
                            <option value="RED">RED</option>
                            <option value="BLACK">BLACK</option>
                            <option value="BLUE">BLUE</option>
                            <option value="BROWN">BROWN</option>
                        </select>
                    </div>

                    <div>
                        <label>Цвет волос: </label>
                        <select name="hairColor" value={formData.hairColor} onChange={handleChange}>
                            <option value="GREEN">GREEN</option>
                            <option value="RED">RED</option>
                            <option value="BLACK">BLACK</option>
                            <option value="BLUE">BLUE</option>
                            <option value="BROWN">BROWN</option>
                        </select>
                    </div>

                    <div>
                        <label>Рост <span style={{ color: 'red' }}>*</span>: </label>
                        <input
                            type="text"
                            inputMode="numeric"
                            name="height"
                            value={formData.height}
                            onKeyDown={handleHeightKeyDown}
                            onChange={handleChange}
                        />
                        {errors.height && (
                            <div style={{ color: 'crimson', fontSize: '13px' }}>{errors.height}</div>
                        )}
                    </div>

                    <div>
                        <label>Паспорт ID <span style={{ color: 'red' }}>*</span>: </label>
                        <input
                            type="text"
                            name="passportID"
                            value={formData.passportID}
                            onChange={handleChange}
                        />
                        {errors.passportID && (
                            <div style={{ color: 'crimson', fontSize: '13px' }}>{errors.passportID}</div>
                        )}
                    </div>

                    {/* Локация */}
                    <div style={{ paddingTop: '10px', marginTop: '10px' }}>
                        <div>
                            <label>Создать новую локацию? <span style={{ color: 'red' }}>*</span></label>
                            <input
                                type="checkbox"
                                name="createNewLocation"
                                checked={formData.createNewLocation}
                                onChange={handleChange}
                            />
                        </div>

                        {!formData.createNewLocation ? (
                            <div style={{ marginTop: '5px' }}>
                                <label>ID существующей локации <span style={{ color: 'red' }}>*</span>: </label>
                                <input
                                    type="number"
                                    min="1"
                                    name="locationId"
                                    value={formData.locationId}
                                    onChange={handleChange}
                                />
                                {errors.locationId && (
                                    <div style={{ color: 'crimson', fontSize: '13px' }}>{errors.locationId}</div>
                                )}
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '5px' }}>
                                <input
                                    type="number"
                                    name="newLocationX"
                                    placeholder="X *"
                                    value={formData.newLocationX}
                                    onChange={handleChange}
                                />
                                {errors.newLocationX && (
                                    <div style={{ color: 'crimson', fontSize: '13px' }}>{errors.newLocationX}</div>
                                )}

                                <input
                                    type="number"
                                    step="any"
                                    name="newLocationY"
                                    placeholder="Y *"
                                    value={formData.newLocationY}
                                    onChange={handleChange}
                                />
                                {errors.newLocationY && (
                                    <div style={{ color: 'crimson', fontSize: '13px' }}>{errors.newLocationY}</div>
                                )}

                                <input
                                    type="number"
                                    name="newLocationZ"
                                    placeholder="Z *"
                                    value={formData.newLocationZ}
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
                </div>
            </div>

            {hasErrors && (
                <div style={{ color: 'crimson', marginBottom: '10px', fontSize: '13px' }}>
                    Сохранение заблокировано: исправьте выделенные поля.
                </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={SubmitPerson}>Подтвердить изменения</button>
                <button type="button" onClick={CloseForm}>Закрыть</button>
            </div>
        </div>
    );
}