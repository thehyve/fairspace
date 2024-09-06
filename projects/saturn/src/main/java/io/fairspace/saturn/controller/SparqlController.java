package io.fairspace.saturn.controller;

import io.fairspace.saturn.controller.validation.ValidSparqlReadQuery;
import io.fairspace.saturn.services.views.SparqlQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/rdf")
@Validated
@RequiredArgsConstructor
public class SparqlController {

    private final SparqlQueryService sparqlQueryService;

    /**
     * Execute a read-only SPARQL query.
     *
     * @param sparqlQuery the SPARQL query
     * @return the result of the query (JSON)
     */
    @PostMapping(value = "/query", consumes = "application/sparql-query", produces = "application/json")
    @PreAuthorize("@permissionService.hasMetadataQueryPermission()")
    public ResponseEntity<String> executeSparqlQuery(@ValidSparqlReadQuery @RequestBody String sparqlQuery) {
        var json = sparqlQueryService.executeQuery(sparqlQuery);
        return ResponseEntity.ok(json);
    }

}
