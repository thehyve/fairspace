package io.fairspace.saturn.services.views;

public interface QueryService {
    ViewPageDTO retrieveViewPage(ViewRequest request);

    CountDTO count(CountRequest request);
}
