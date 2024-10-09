package io.fairspace.saturn.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.fairspace.saturn.config.Services;
import io.fairspace.saturn.controller.dto.SearchResultsDto;
import io.fairspace.saturn.controller.dto.request.FileSearchRequest;
import io.fairspace.saturn.controller.dto.request.LookupSearchRequest;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final Services services;

    @PostMapping(value = "/files")
    public ResponseEntity<SearchResultsDto> searchFiles(@RequestBody FileSearchRequest request) {
        var searchResult = services.getFileSearchService().searchFiles(request);
        var resultDto = SearchResultsDto.builder()
                .results(searchResult)
                .query(request.getQuery())
                .build();
        return ResponseEntity.ok(resultDto);
    }

    @PostMapping(value = "/lookup")
    public ResponseEntity<SearchResultsDto> lookupSearch(@RequestBody LookupSearchRequest request) {
        var results = services.getSearchService().getLookupSearchResults(request);
        return ResponseEntity.ok(results);
    }
}
