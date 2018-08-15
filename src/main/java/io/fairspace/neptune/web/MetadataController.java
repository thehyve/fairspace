package io.fairspace.neptune.web;

import io.fairspace.neptune.model.PredicateInfo;
import io.fairspace.neptune.service.MetadataService;
import org.apache.jena.rdf.model.Model;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for managing triples and predicates with extra information.
 */

@RestController
@RequestMapping("/metadata")
public class MetadataController {

    private MetadataService metadataService;

    public MetadataController(@Autowired MetadataService metadataService) {
        this.metadataService = metadataService;
    }

    /**
     * Get all the metadata surrounding the uri.
     *
     * @param uri the uri of interest.
     * @return the triples with predicates and their information
     */
    @GetMapping(produces = "application/ld+json")
    public Model get(@RequestParam String uri) {
        return metadataService.retrieveMetadata(uri);
    }

    /**
     * Store a list of triples.
     *
     * @param triples a list of triple objects.
     */
    @PostMapping(consumes = "application/ld+json")
    public void postTriples(@RequestBody Model triples) {
        metadataService.postTriples(triples);
    }

    /**
     * Delete a list of triples.
     *
     * @param triples a list of triple objects.
     */
    @DeleteMapping(consumes = "application/ld+json")
    public void deleteTriples(@RequestBody Model triples) {
        metadataService.deleteTriples(triples);
    }
}
