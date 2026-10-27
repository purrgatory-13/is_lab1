package org.example;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.example.entities.Location;
import org.example.entities.Person;

import java.util.List;

@ApplicationScoped
public class PersonDao {
    

    @PersistenceContext
    EntityManager em;

    public void create(Person p) {

        if (p.getLocation() != null && p.getLocation().getId() > 0) {
            Location managedLocation = em.find(Location.class, p.getLocation().getId());
            p.setLocation(managedLocation);
        }
        em.persist(p);
    }

    public void update(Person p) {
        if (p.getLocation() != null && p.getLocation().getId() > 0) {
            Location managedLocation = em.find(Location.class, p.getLocation().getId());
            p.setLocation(managedLocation);
        }
        em.merge(p);
    }

    public Person findById(int id){
        return em.find(Person.class, id);
    }

    public List<Person> findAll(){
        return em.createQuery("SELECT p FROM Person p", Person.class).getResultList();
    }

    public void remove(int id){
        Person p = em.find(Person.class, id);
        if (p!=null) {
            em.remove(p);
        }
    }

    public List<Person> findNameSubstr(String str){
        return em.createQuery("SELECT p FROM Person p WHERE LOWER(p.name) LIKE LOWER(:searchPattern)")
                .setParameter("searchPattern", "%" + str + "%")
                .getResultList();
    }

    public boolean isReferencedByBands(int personId) {
        Long count = em.createQuery("SELECT COUNT(b) FROM MusicBand b WHERE b.frontMan.id = :id", Long.class)
                .setParameter("id", personId)
                .getSingleResult();
        return count > 0;
    }
}
