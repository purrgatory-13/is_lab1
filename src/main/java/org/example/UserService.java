package org.example;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.example.entities.User;

@ApplicationScoped
@Transactional
public class UserService {
    @Inject
    private UserDao userDao;

    public void register(User user) {
        if (user == null || user.getUsername() == null || user.getUsername().isBlank()
                || user.getPassword() == null || user.getPassword().isBlank()) {
            throw new IllegalArgumentException("Логин и пароль обязательны");
        }
        User existing = userDao.findByUsername(user.getUsername());
        if (existing != null) {
            throw new IllegalStateException("Пользователь с таким именем уже существует");
        }
        user.setPassword(PasswordUtil.hashPassword(user.getPassword()));
        userDao.create(user);
    }

    public String login(String username, String password) {
        User user = userDao.findByUsername(username);
        if (user == null || !PasswordUtil.verifyPassword(password, user.getPassword())) {
            throw new IllegalArgumentException("Неверный логин или пароль");
        }
        return JwtUtil.generateToken(user.getUsername());
    }
}