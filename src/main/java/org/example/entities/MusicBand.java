package org.example.entities;

import jakarta.json.bind.annotation.JsonbDateFormat;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.ZonedDateTime;
import java.util.Date;


@Entity
@Table(name="music_bands")
public class MusicBand {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id; //Значение поля должно быть больше 0, Значение этого поля должно быть уникальным, Значение этого поля должно генерироваться автоматически
    @NotBlank
    private String name; //Поле не может быть null, Строка не может быть пустой
    @NotNull
    private Coordinates coordinates; //Поле не может быть null
    //@NotNull
    @JsonbDateFormat
    private java.util.Date creationDate = new java.util.Date(); //Поле не может быть null, Значение этого поля должно генерироваться автоматически
    @Enumerated(EnumType.STRING)
    @NotNull
    private MusicGenre genre; //Поле не может быть null
    @Min(1)
    private Long numberOfParticipants; //Поле может быть null, Значение поля должно быть больше 0
    @Min(1)
    private Integer singlesCount; //Поле может быть null, Значение поля должно быть больше 0
    @NotNull
    private String description; //Поле не может быть null
    @JoinColumn(unique = true)
    //наверное надо делать проверку на не налл при создании, а тут всё ок
    @OneToOne(cascade = CascadeType.PERSIST)
    private Album bestAlbum;
    @NotNull
    @Min(1)
    private Integer albumsCount; //Поле не может быть null, Значение поля должно быть больше 0
    @NotNull
    private java.time.ZonedDateTime establishmentDate; //Поле не может быть null
    @NotNull
    @ManyToOne(cascade = CascadeType.PERSIST)
    private Person frontMan; //Поле не может быть null

    @PrePersist
    protected void onCreate() {
        if (creationDate == null) {
            creationDate = new java.util.Date();
        }
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Coordinates getCoordinates() {
        return coordinates;
    }

    public void setCoordinates(Coordinates coordinates) {
        this.coordinates = coordinates;
    }

    public Date getCreationDate() {
        return creationDate;
    }

    public void setCreationDate(Date creationDate) {
        this.creationDate = creationDate;
    }

    public MusicGenre getGenre() {
        return genre;
    }

    public void setGenre(MusicGenre genre) {
        this.genre = genre;
    }

    public Long getNumberOfParticipants() {
        return numberOfParticipants;
    }

    public void setNumberOfParticipants(Long numberOfParticipants) {
        this.numberOfParticipants = numberOfParticipants;
    }

    public Integer getSinglesCount() {
        return singlesCount;
    }

    public void setSinglesCount(Integer singlesCount) {
        this.singlesCount = singlesCount;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Album getBestAlbum() {
        return bestAlbum;
    }

    public void setBestAlbum(Album bestAlbum) {
        this.bestAlbum = bestAlbum;
    }

    public Integer getAlbumsCount() {
        return albumsCount;
    }

    public void setAlbumsCount(Integer albumsCount) {
        this.albumsCount = albumsCount;
    }

    public ZonedDateTime getEstablishmentDate() {
        return establishmentDate;
    }

    public void setEstablishmentDate(ZonedDateTime establishmentDate) {
        this.establishmentDate = establishmentDate;
    }

    public Person getFrontMan() {
        return frontMan;
    }

    public void setFrontMan(Person frontMan) {
        this.frontMan = frontMan;
    }


    public MusicBand() {
    }
}