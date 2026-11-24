package org.example;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.sse.OutboundSseEvent;
import jakarta.ws.rs.sse.Sse;
import jakarta.ws.rs.sse.SseBroadcaster;
import jakarta.ws.rs.sse.SseEventSink;

import java.util.logging.Level;
import java.util.logging.Logger;

@ApplicationScoped
public class EventBroadcaster {

    private static final Logger LOGGER = Logger.getLogger(EventBroadcaster.class.getName());

    private volatile Sse sse;
    private volatile SseBroadcaster broadcaster;

    public synchronized void register(Sse sse, SseEventSink sink) {
        if (sse != null && this.sse == null) {
            this.sse = sse;
        }
        if (this.broadcaster == null && this.sse != null) {
            this.broadcaster = this.sse.newBroadcaster();
            this.broadcaster.onError((eventSink, throwable) ->
                    LOGGER.log(Level.FINE, "SSE client disconnected or error", throwable));
        }
        if (this.broadcaster != null && sink != null) {
            this.broadcaster.register(sink);
        }
    }

    public void notifyChange(String entity, String action) {
        Sse currentSse = this.sse;
        SseBroadcaster currentBroadcaster = this.broadcaster;
        if (currentSse == null || currentBroadcaster == null) {
            return;
        }

        String safeEntity = escapeJson(entity);
        String safeAction = escapeJson(action);
        String payload = "{\"entity\":\"" + safeEntity + "\",\"action\":\"" + safeAction + "\"}";

        OutboundSseEvent event = currentSse.newEventBuilder()
                .name("entity-changed")
                .mediaType(MediaType.APPLICATION_JSON_TYPE)
                .data(String.class, payload)
                .reconnectDelay(2000)
                .build();

        currentBroadcaster.broadcast(event);
    }

    private String escapeJson(String value) {
        if (value == null) return "";
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}