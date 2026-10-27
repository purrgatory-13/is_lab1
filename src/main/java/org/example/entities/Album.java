package org.example.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
public class Album {
    @NotNull
    @NotBlank
    private String name; //Поле не может быть null, Строка не может быть пустой
    @Min(1)
    private int tracks; //Значение поля должно быть больше 0
    @Min(1)
    private long sales; //Значение поля должно быть больше 0

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getTracks() {
        return tracks;
    }

    public void setTracks(int tracks) {
        this.tracks = tracks;
    }

    public long getSales() {
        return sales;
    }

    public void setSales(long sales) {
        this.sales = sales;
    }

    public int getId() {
        return id;
    }

    public Album() {
    }

    public void setId(int id) {
        this.id = id;
    }
}