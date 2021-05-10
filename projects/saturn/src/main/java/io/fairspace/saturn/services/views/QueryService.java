package io.fairspace.saturn.services.views;

import io.fairspace.saturn.services.search.FileSearchRequest;
import io.fairspace.saturn.services.search.SearchResultDTO;

import java.util.ArrayList;

public interface QueryService {
    ViewPageDTO retrieveViewPage(ViewRequest request);

    CountDTO count(CountRequest request);

    ArrayList<SearchResultDTO> getFilesByText(FileSearchRequest request);
}
