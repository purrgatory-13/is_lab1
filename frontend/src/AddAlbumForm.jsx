import {toast} from "react-toastify";
import {useState} from "react";

export default function AddAlbumForm({onClose}){
    const CloseForm = () => {
        toast.error("Данные не сохранены")
        onClose();
    }

    const [formData, setFormData] = useState({
        name: '',
        tracks: '',
        sales: ''
    });

    function handleChange(e) {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    }

    const SubmitAlbum = async () => {
        try {
            const payload = {
                name: formData.name,
                tracks: Number(formData.tracks),
                sales: Number(formData.sales)
            };

            const response = await fetch('http://localhost:8080/is_lab1/albums', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(errText || 'Ошибка при сохранении альбома');
            }

            toast.success("Альбом успешно добавлен!");
            onClose();
        } catch (err) {
            toast.error(err.message);
        }
    };

    return(
        <div>
            <div>
                <h1>Добавить альбом</h1>
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
                    <label>Треки:</label>
                    <input
                        type="number"
                        name="tracks"
                        value={formData.tracks}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Продажи:</label>
                    <input
                        type="number"
                        name="sales"
                        value={formData.sales}
                        onChange={handleChange}
                    />
                </div>
            </div>
            <div>
                <button onClick={SubmitAlbum}>Добавить</button>
            </div>
        </div>
    );
}