package org.example.entities;

import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotNull;

@Embeddable
public class Coordinates {
    @Max(810)
    private double x; //Максимальное значение поля: 810
    @NotNull
    private Float y; //Поле не может быть null

    public Float getY() {
        return y;
    }

    public void setY(Float y) {
        this.y = y;
    }

    public double getX() {
        return x;
    }

    public void setX(double x) {
        this.x = x;
    }

    public Coordinates() {}
}