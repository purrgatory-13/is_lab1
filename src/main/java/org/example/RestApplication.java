package org.example;

import jakarta.ws.rs.ApplicationPath;
import jakarta.ws.rs.core.Application;
import java.util.HashSet;
import java.util.Set;

@ApplicationPath("/")
public class RestApplication extends Application {
    @Override
    public Set<Class<?>> getClasses() {
        Set<Class<?>> resources = new HashSet<>();
        resources.add(MusicBandResource.class);
        resources.add(LocationResource.class);
        resources.add(PersonResource.class);
        resources.add(AlbumResource.class);
        resources.add(UserResource.class);
        resources.add(EventStreamResource.class);
        resources.add(JwtAuthFilter.class);
        resources.add(CorsFilter.class);
        return resources;
    }
}