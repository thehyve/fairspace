package io.fairspace.neptune.web;

import io.fairspace.neptune.business.MetadataService;
import io.fairspace.neptune.business.PredicateInfo;
import io.fairspace.neptune.business.Triple;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
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
    @GetMapping
    public CombinedTriplesWithPredicateInfo get(@RequestParam URI uri) {
        return metadataService.retrieveMetadata(uri);
    }

    /**
     * Store a list of triples.
     *
     * @param triples a list of triple objects.
     */
    @PostMapping
    public void postTriples(@RequestBody List<Triple> triples) {
        metadataService.postTriples(triples);
    }

    /**
     * Delete a list of triples.
     *
     * @param triples a list of triple objects.
     */
    @DeleteMapping
    public void deleteTriples(@RequestBody List<Triple> triples) {
        metadataService.deleteTriples(triples);
    }

    /**
     * Store a predicate with a specified label
     *
     * @param predicateInfo the predicate with label
     */
    @PostMapping("/predicate")
    public void postPredicateInfo(@RequestBody PredicateInfo predicateInfo) {
        metadataService.postPredicateInfo(predicateInfo);
    }

    /**
     * Store a list of predicates with their specified label
     *
     * @param predicateInfoList the list of predicates with their label
     */
    @PostMapping("/predicates")
    public void postPredicateInfo(@RequestBody List<PredicateInfo> predicateInfoList) {
        metadataService.postPredicateInfoList(predicateInfoList);
    }

}
