package org.example;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.example.entities.Location;

import java.util.List;

@ApplicationScoped
@Transactional
public class LocationService {
    @Inject
    LocationDao dao;

    @Inject
    EventBroadcaster eventBroadcaster;

    public void create(Location l) {
        dao.create(l);
        eventBroadcaster.notifyChange("location", "create");
    }

    public void update(Location l) {
        dao.update(l);
        eventBroadcaster.notifyChange("location", "update");
    }

    public Location findById(int id) {
        return dao.findById(id);
    }

    public List<Location> findAll() {
        return dao.findAll();
    }

    public void remove(int id) {
        Location location = dao.findById(id);
        if (location == null) {
            throw new IllegalArgumentException("Локация для удаления не найдена");
        }
        if (dao.isReferencedByPersons(id)) {
            throw new IllegalStateException("Нельзя удалить локацию, так как на нее ссылается музыкант");
        }
        dao.remove(id);
        eventBroadcaster.notifyChange("location", "delete");
    }

    public List<Location> findNameSubstr(String str) {
        return dao.findNameSubstr(str);
    }

    public List<Location> findPage(int page, int size) {
        return dao.findPage(page, size);
    }

    public long countAll() {
        return dao.countAll();
    }

    public List<Location> findFilteredPage(String filterField, String filterValue, int page, int size) {
        return dao.findFilteredPage(filterField, filterValue, page, size);
    }

    public long countFiltered(String filterField, String filterValue) {
        return dao.countFiltered(filterField, filterValue);
    }
}