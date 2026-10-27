import {toast} from "react-toastify";
import {useState, useEffect} from "react";

export default function ModifyLocationForm({ locationId, onClose }) {
    const [formData, setFormData] = useState({
        x: '',
        y: '',
        z: '',
        name: ''
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!locationId) return;

        fetch(`http://localhost:8080/is_lab1/locations/${locationId}`)
            .then(res => {
                if (!res.ok) throw new Error("Не удалось загрузить данные локации");
                return res.json();
            })
            .then(data => {
                setFormData({
                    x: data.x ?? '',
                    y: data.y ?? '',
                    z: data.z ?? '',
                    name: data.name || ''
                });
                setLoading(false);
            })
            .catch(err => {
                toast.error(err.message);
                setLoading(false);
            });
    }, [locationId]);

    const CloseForm = () => {
        toast.info("Изменения не сохранены");
        onClose();
    };

    const SubmitLocation = async () => {
        try {
            const payload = {
                x: Number(formData.x),
                y: Number(formData.y),
                z: Number(formData.z),
                name: formData.name || null
            };

            const response = await fetch(`http://localhost:8080/is_lab1/locations/${locationId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(errText || 'Ошибка при обновлении локации');
            }

            toast.success("Локация успешно изменена!");
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
        return <div>Загрузка данных локации...</div>;
    }

    return (
        <div>
            <div className="ModifyFormDiv">
                <h2>Изменить локацию (ID: {locationId})</h2>
                <button onClick={CloseForm}>Закрыть</button>
                <div>
                    <label>X:</label>
                    <input
                        type="number"
                        name="x"
                        value={formData.x}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Y:</label>
                    <input
                        type="number"
                        name="y"
                        value={formData.y}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Z:</label>
                    <input
                        type="number"
                        name="z"
                        value={formData.z}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Название:</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                    />
                </div>
            </div>
            <div>
                <button onClick={SubmitLocation}>Подтвердить изменения</button>
            </div>
        </div>
    );
}