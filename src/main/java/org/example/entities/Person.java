package org.example.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Entity
public class Person {
    @NotBlank
    private String name; //Поле не может быть null, Строка не может быть пустой
    @Enumerated(EnumType.STRING)
    private Color eyeColor; //Поле может быть null
    @Enumerated(EnumType.STRING)
    private Color hairColor; //Поле может быть null
    @NotNull
    @ManyToOne(cascade = CascadeType.PERSIST)
    private Location location;  //Поле не может быть null
    @Min(1)
    private long height; //Значение поля должно быть больше 0
    @Size(max=44)
    @Column(unique = true)
    @NotNull
    private String passportID; //Длина строки не должна быть больше 44, Значение этого поля должно быть уникальным, Поле не может быть null

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    public Person() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Color getEyeColor() {
        return eyeColor;
    }

    public void setEyeColor(Color eyeColor) {
        this.eyeColor = eyeColor;
    }

    public Color getHairColor() {
        return hairColor;
    }

    public void setHairColor(Color hairColor) {
        this.hairColor = hairColor;
    }

    public Location getLocation() {
        return location;
    }

    public void setLocation(Location location) {
        this.location = location;
    }

    public long getHeight() {
        return height;
    }

    public void setHeight(long height) {
        this.height = height;
    }

    public String getPassportID() {
        return passportID;
    }

    public void setPassportID(String passportID) {
        this.passportID = passportID;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }
}