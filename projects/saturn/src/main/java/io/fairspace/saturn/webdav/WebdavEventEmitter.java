package io.fairspace.saturn.webdav;

import io.fairspace.saturn.events.EventService;
import io.fairspace.saturn.events.FileSystemEvent;
import io.milton.http.Request;
import lombok.extern.slf4j.Slf4j;

import java.util.Map;
import java.util.function.Consumer;

@Slf4j
public class WebdavEventEmitter implements Consumer<Request> {
    private static Map<Request.Method, FileSystemEvent.FileEventType> httpMethodToEventTypeMap = Map.of(
            Request.Method.MKCOL, FileSystemEvent.FileEventType.DIRECTORY_CREATED,
            Request.Method.COPY, FileSystemEvent.FileEventType.COPIED,
            Request.Method.MOVE, FileSystemEvent.FileEventType.MOVED,
            Request.Method.DELETE, FileSystemEvent.FileEventType.DELETED,
            Request.Method.PUT, FileSystemEvent.FileEventType.FILE_WRITTEN,
            Request.Method.GET, FileSystemEvent.FileEventType.FILE_READ
    );
    private EventService eventService;

    public WebdavEventEmitter(EventService eventService) {
        this.eventService = eventService;
    }

    @Override
    public void accept(Request request) {
        if(!httpMethodToEventTypeMap.containsKey(request.getMethod())) {
            log.debug("No event to emit for http method {}", request.getMethod());
            return;
        }

        FileSystemEvent.FileSystemEventBuilder builder = FileSystemEvent.builder()
                .eventType(httpMethodToEventTypeMap.get(request.getMethod()))
                .path(request.getAbsolutePath());


        // For copy and move operations, the destination of the operation is relevant as well
        if(request.getMethod() == Request.Method.COPY || request.getMethod() == Request.Method.MOVE) {
            builder.destination(request.getDestinationHeader());
        }

        eventService.emitEvent(builder.build());
    }
}
