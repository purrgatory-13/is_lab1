package org.example;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.example.entities.Location;

import java.util.List;

@ApplicationScoped
public class LocationDao {

    @PersistenceContext
    EntityManager em;

    public void create(Location l) {
        em.persist(l);
    }

    public void update(Location l) {
        em.merge(l);
    }

    public Location findById(int id) {
        return em.find(Location.class, id);
    }

    public List<Location> findAll() {
        return em.createQuery("SELECT l FROM Location l", Location.class).getResultList();
    }

    public void remove(int id) {
        Location l = em.find(Location.class, id);
        if (l != null) {
            em.remove(l);
        }
    }

    public boolean isReferencedByPersons(int locationId) {
        Long count = em.createQuery("SELECT COUNT(p) FROM Person p WHERE p.location.id = :id", Long.class)
                .setParameter("id", locationId)
                .getSingleResult();
        return count > 0;
    }

    public List<Location> findNameSubstr(String str) {
        return em.createQuery("SELECT l FROM Location l WHERE LOWER(l.name) LIKE LOWER(:searchPattern)")
                .setParameter("searchPattern", "%" + str + "%")
                .getResultList();
    }
}