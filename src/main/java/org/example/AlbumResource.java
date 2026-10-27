package org.example;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.example.entities.Album;

import java.util.List;

@Path("/albums")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AlbumResource {
    @Inject
    private AlbumService service;

    @GET
    public List<Album> getList() {
        return service.findAll();
    }

    @GET
    @Path("/{id}")
    public Album getById(@PathParam("id") int id) {
        return service.findById(id);
    }

    @GET
    @Path("/substr/{str}")
    public List<Album> findSubstr(@PathParam("str") String str) {
        return service.findNameSubstr(str);
    }

    @POST
    public void newAlbum(Album a) {
        try {
            service.create(a);
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
    public Response updAlbum(@PathParam("id") int id, Album album) {
        try {
            Album existing = service.findById(id);
            if (existing == null) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("Альбом для обновления не найден")
                        .build();
            }
            album.setId(id);
            service.update(album);
            return Response.ok("Альбом успешно обновлен").build();
        } catch (Exception e) {
            String msg = e.getMessage() != null ? e.getMessage() : "Не удалось обновить альбом";
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(msg)
                    .build();
        }
    }

    @DELETE
    @Path("/{id}")
    public Response deleteAlbum(@PathParam("id") int id) {
        try {
            service.remove(id);
            return Response.ok("Альбом успешно удален").build();
        } catch (Exception e) {
            String msg = e.getMessage() != null ? e.getMessage() : "Не удалось удалить альбом";
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(msg)
                    .build();
        }
    }
}