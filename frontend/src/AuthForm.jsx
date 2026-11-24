import { useState } from 'react';
import { toast } from 'react-toastify';
import { apiFetch, setToken } from './api.js';

export default function AuthForm({ onLoginSuccess }) {
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!username.trim() || !password.trim()) {
            toast.warn("Заполните все поля!");
            return;
        }

        const endpoint = isLoginMode ? '/auth/login' : '/auth/register';

        apiFetch(endpoint, {
            method: 'POST',
            credentials: 'include',
            body: JSON.stringify({ username, password })
        })
            .then(async res => {
                const rawText = await res.text();
                let parsed = null;
                try {
                    parsed = rawText ? JSON.parse(rawText) : null;
                } catch (_) {
                    parsed = null;
                }

                if (!res.ok) {
                    const message = parsed?.error || parsed?.message || rawText || "Ошибка авторизации";
                    throw new Error(message);
                }

                return parsed ?? rawText;
            })
            .then((data) => {
                if (isLoginMode) {
                    if (data?.token) {
                        setToken(data.token);
                    }
                    toast.success("Успешный вход!");
                    onLoginSuccess(data?.username || username);
                } else {
                    toast.success("Регистрация успешна! Теперь войдите.");
                    setIsLoginMode(true);
                }
            })
            .catch(err => {
                toast.error(err.message);
            });
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100svh',
            width: '100%'
        }}>
            <form onSubmit={handleSubmit} style={{
                width: '320px',
                maxWidth: '90%',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
            }}>
                <h2 style={{ textAlign: 'center', marginBottom: '8px' }}>
                    {isLoginMode ? 'Вход' : 'Регистрация'}
                </h2>

                <input
                    type="text"
                    placeholder="Логин"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button type="submit">
                    {isLoginMode ? 'Войти' : 'Зарегистрироваться'}
                </button>

                <button
                    type="button"
                    onClick={() => setIsLoginMode(!isLoginMode)}
                >
                    {isLoginMode ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
                </button>
            </form>
        </div>
    );
}