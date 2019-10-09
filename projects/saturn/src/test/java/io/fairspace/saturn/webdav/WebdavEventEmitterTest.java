package io.fairspace.saturn.webdav;

import io.fairspace.saturn.events.Event;
import io.fairspace.saturn.events.FileSystemEvent;
import io.milton.http.Request;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import java.util.ArrayList;
import java.util.List;

import static org.junit.Assert.*;
import static org.mockito.Mockito.when;

@RunWith(MockitoJUnitRunner.class)
public class WebdavEventEmitterTest {
    public static final String ABSOLUTE_PATH = "/a/b/c";
    private static final String DESTINATION_PATH = "/d/e/f";
    @Mock
    Request request;

    private List<Event> events;
    private WebdavEventEmitter emitter;

    @Before
    public void setUp() throws Exception {
        events = new ArrayList<>();
        emitter = new WebdavEventEmitter(events::add);

    }

    @Test
    public void eventIncludesMethodAndPath() {
        when(request.getAbsolutePath()).thenReturn(ABSOLUTE_PATH);
        when(request.getMethod()).thenReturn(Request.Method.PROPFIND);

        emitter.accept(request);

        assertEquals(List.of(new FileSystemEvent(FileSystemEvent.FileEventType.LISTED, ABSOLUTE_PATH, null)), events);
    }

    @Test
    public void copyEventIncludesDestination() {
        when(request.getAbsolutePath()).thenReturn(ABSOLUTE_PATH);
        when(request.getMethod()).thenReturn(Request.Method.COPY);
        when(request.getDestinationHeader()).thenReturn(DESTINATION_PATH);

        emitter.accept(request);

        assertEquals(List.of(new FileSystemEvent(FileSystemEvent.FileEventType.COPIED, ABSOLUTE_PATH, DESTINATION_PATH)), events);
    }

    @Test
    public void moveEventIncludesDestination() {
        when(request.getAbsolutePath()).thenReturn(ABSOLUTE_PATH);
        when(request.getMethod()).thenReturn(Request.Method.MOVE);
        when(request.getDestinationHeader()).thenReturn(DESTINATION_PATH);

        emitter.accept(request);

        assertEquals(List.of(new FileSystemEvent(FileSystemEvent.FileEventType.MOVED, ABSOLUTE_PATH, DESTINATION_PATH)), events);
    }

    @Test
    public void unknownMethodsAreIgnored() {
        when(request.getMethod()).thenReturn(Request.Method.CONNECT);

        emitter.accept(request);

        assertTrue(events.isEmpty());
    }
}
