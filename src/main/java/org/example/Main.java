package org.example;

import jakarta.persistence.Persistence;

public class Main {
    public static void main(String[] args) {
        System.out.println("Пытаемся подключиться к базе данных и создать таблицы...");
        try {
            var emf = Persistence.createEntityManagerFactory("MusicBandPU");
            var em = emf.createEntityManager();

            // Принудительно открываем транзакцию, чтобы провайдер инициализировал схему базы
            em.getTransaction().begin();
            em.getTransaction().commit();

            em.close();
            emf.close();
            System.out.println("Успех! Подключение прошло, таблицы созданы.");
        } catch (Exception e) {
            System.err.println("Ошибка при подключении:");
            e.printStackTrace();
        }
    }
}