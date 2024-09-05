package io.fairspace.saturn.services.search;

import java.util.List;

public interface FileSearchService {
    List<SearchResultDTO> searchFiles(FileSearchRequest request);
}
