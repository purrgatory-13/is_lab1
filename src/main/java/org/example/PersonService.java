package org.example;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.example.entities.Person;

import java.util.List;

@ApplicationScoped
@Transactional
public class PersonService {
    @Inject
    PersonDao dao;

    @Inject
    EventBroadcaster eventBroadcaster;

    public void create(Person mb) {
        dao.create(mb);
        eventBroadcaster.notifyChange("person", "create");
    }

    public void update(Person mb) {
        dao.update(mb);
        eventBroadcaster.notifyChange("person", "update");
    }

    public Person findById(int id) {
        return dao.findById(id);
    }

    public List<Person> findAll() {
        return dao.findAll();
    }

    public void remove(int id) {
        Person person = dao.findById(id);
        if (person == null) {
            throw new IllegalArgumentException("Музыкант для удаления не найден");
        }
        if (person.getLocation() != null) {
            throw new IllegalStateException("Нельзя удалить музыканта, так как он привязан к локации");
        }

        if (dao.isReferencedByBands(id)) {
            throw new IllegalStateException("Нельзя удалить музыканта, так как он является фронтменом музыкальной группы");
        }
        dao.remove(id);
        eventBroadcaster.notifyChange("person", "delete");
    }

    public List<Person> findPage(int page, int size) {
        return dao.findPage(page, size);
    }

    public long countAll() {
        return dao.countAll();
    }

    public List<Person> findFilteredPage(String filterField, String filterValue, int page, int size) {
        return dao.findFilteredPage(filterField, filterValue, page, size);
    }

    public long countFiltered(String filterField, String filterValue) {
        return dao.countFiltered(filterField, filterValue);
    }

    public List<Person> findNameSubstr(String str) {
        return dao.findNameSubstr(str);
    }
}