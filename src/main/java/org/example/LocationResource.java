package org.example;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.example.entities.Location;

import java.util.List;

@Path("/locations")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class LocationResource {
    @Inject
    private LocationService service;

    @GET
    public Response getList(
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("10") int size,
            @QueryParam("filterField") String filterField,
            @QueryParam("filterValue") String filterValue
    ) {
        int safePage = Math.max(0, page);
        int safeSize = Math.min(Math.max(1, size), 100);

        boolean useFilter = filterField != null && !filterField.isBlank()
                && filterValue != null && !filterValue.isEmpty();

        List<Location> items = useFilter
                ? service.findFilteredPage(filterField.trim(), filterValue, safePage, safeSize)
                : service.findPage(safePage, safeSize);

        long totalItems = useFilter
                ? service.countFiltered(filterField.trim(), filterValue)
                : service.countAll();

        int totalPages = (int) Math.ceil((double) totalItems / safeSize);

        MusicBandResource.PageResponse<Location> responseBody =
                new MusicBandResource.PageResponse<>(items, safePage, safeSize, totalItems, totalPages);

        return Response.ok(responseBody).build();
    }

    @GET
    @Path("/{id}")
    public Location getById(@PathParam("id") int id) {
        return service.findById(id);
    }

    @GET
    @Path("/substr/{str}")
    public List<Location> findSubstr(@PathParam("str") String str) {
        return service.findNameSubstr(str);
    }

    @POST
    public void newLocation(Location l) {
        try {
            service.create(l);
        } catch (jakarta.validation.ConstraintViolationException e) {
            System.err.println("--- Validation error ---");
            e.getConstraintViolations().forEach(v -> {
                System.err.println("Field: " + v.getPropertyPath() + " | Err: " + v.getMessage() + " | Value: " + v.getInvalidValue());
            });
            throw e;
        }
    }

    @PUT
    @Path("/{id}")
    public Response updLocation(@PathParam("id") int id, Location location) {
        try {
            Location existing = service.findById(id);
            if (existing == null) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("Локация для обновления не найдена")
                        .build();
            }
            location.setId(id);
            service.update(location);
            return Response.ok("Локация успешно обновлена").build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(e.getMessage() != null ? e.getMessage() : "Не удалось обновить локацию")
                    .build();
        }
    }

    @DELETE
    @Path("/{id}")
    public Response deleteLocation(@PathParam("id") int id) {
        try {
            service.remove(id);
            return Response.ok("Локация успешно удалена").build();
        } catch (Exception e) {
            String msg = e.getMessage() != null ? e.getMessage() : "Не удалось удалить локацию";
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(msg)
                    .build();
        }
    }
}