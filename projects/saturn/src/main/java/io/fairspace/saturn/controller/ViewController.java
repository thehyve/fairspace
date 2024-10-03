package io.fairspace.saturn.controller;

import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.fairspace.saturn.config.Services;
import io.fairspace.saturn.controller.dto.CountDto;
import io.fairspace.saturn.controller.dto.FacetsDto;
import io.fairspace.saturn.controller.dto.ViewPageDto;
import io.fairspace.saturn.controller.dto.ViewsDto;
import io.fairspace.saturn.controller.dto.request.CountRequest;
import io.fairspace.saturn.controller.dto.request.ViewRequest;

@RestController
@RequestMapping("${application.basePath}/views")
@Validated
public class ViewController {

    private final Services services;

    public ViewController(Services services) {
        this.services = services;
    }

    @GetMapping(value = "/", produces = MediaType.APPLICATION_JSON_VALUE)
    public ViewsDto getViews() {
        var views = services.getViewService().getViews();
        return new ViewsDto(views);
    }

    @PostMapping(value = "/", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ViewPageDto> createView(@Valid @RequestBody ViewRequest requestBody) {
        var result = services.getQueryService().retrieveViewPage(requestBody);
        return ResponseEntity.ok(result);
    }

    @GetMapping(value = "/facets", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<FacetsDto> getFacets() {
        var facets = services.getViewService().getFacets();
        return ResponseEntity.ok(new FacetsDto(facets));
    }

    @PostMapping(
            value = "/count",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<CountDto> count(@Valid @RequestBody CountRequest requestBody) {
        var result = services.getQueryService().count(requestBody);
        return ResponseEntity.ok(result);
    }
}