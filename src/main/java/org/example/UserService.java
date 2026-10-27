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
        User existing = userDao.findByUsername(user.getUsername());
        if (existing != null) {
            throw new IllegalStateException("Пользователь с таким именем уже существует");
        }
        userDao.create(user);
    }

    public User login(String username, String password) {
        User user = userDao.findByUsername(username);
        if (user == null || !user.getPassword().equals(password)) {
            throw new IllegalArgumentException("Неверный логин или пароль");
        }
        return user;
    }
}