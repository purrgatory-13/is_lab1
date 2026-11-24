package org.example;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.example.entities.Person;

import java.util.List;

@Path("/person")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class PersonResource {

    @Inject
    private PersonService mbs;

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

        List<Person> items = useFilter
                ? mbs.findFilteredPage(filterField.trim(), filterValue, safePage, safeSize)
                : mbs.findPage(safePage, safeSize);

        long totalItems = useFilter
                ? mbs.countFiltered(filterField.trim(), filterValue)
                : mbs.countAll();

        int totalPages = (int) Math.ceil((double) totalItems / safeSize);

        MusicBandResource.PageResponse<Person> responseBody =
                new MusicBandResource.PageResponse<>(items, safePage, safeSize, totalItems, totalPages);

        return Response.ok(responseBody).build();
    }

    @GET @Path("/{id}")
    public Response getById(@PathParam("id") int id) {
        Person p = mbs.findById(id);
        if (p == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("Музыкант с таким ID не найден")
                    .build();
        }
        return Response.ok(p).build();
    }

    @GET @Path("/substr/{str}")
    public List<Person> findSubstr(@PathParam("str") String str) {
        return mbs.findNameSubstr(str);
    }

    @POST
    public Response newPerson(Person p) {
        try {
            mbs.create(p);
            return Response.status(Response.Status.CREATED).entity("Музыкант успешно добавлен").build();
        } catch (Exception e) {
            String errorMessage = "Не удалось создать музыканта";

            Throwable cause = e;
            while (cause != null) {
                String msg = cause.getMessage();
                if (msg != null) {
                    if (msg.contains("person_passportid_key") || msg.contains("unique constraint")) {
                        errorMessage = "Музыкант с таким Passport ID уже существует";
                        break;
                    } else if (msg.contains("NotNull") || msg.contains("ConstraintViolation")) {
                        errorMessage = "Заполнены не все обязательные поля или нарушены ограничения";
                        break;
                    }
                }
                cause = cause.getCause();
            }

            if (errorMessage.equals("Не удалось создать музыканта") && e.getMessage() != null) {
                errorMessage = "Ошибка базы данных: " + e.getMessage();
            }

            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(errorMessage)
                    .build();
        }
    }

    @PUT @Path("/{id}")
    public Response updPerson(@PathParam("id") int id, Person person) {
        try {
            Person existing = mbs.findById(id);
            if (existing == null) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("Музыкант для обновления не найден")
                        .build();
            }
            person.setId(id);
            mbs.update(person);
            return Response.ok("Музыкант успешно обновлен").build();
        } catch (Exception e) {
            String errorMessage = e.getMessage() != null ? e.getMessage() : "Не удалось обновить музыканта";
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(errorMessage)
                    .build();
        }
    }

    @DELETE @Path("/{id}")
    public Response deletePerson(@PathParam("id") int id) {
        try {
            Person p = mbs.findById(id);
            if (p == null) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("Музыкант для удаления не найден")
                        .build();
            }
            mbs.remove(id);
            return Response.ok("Музыкант успешно удален").build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Не удалось удалить музыканта, так как на него ссылаются другие объекты").build();
        }
    }
}