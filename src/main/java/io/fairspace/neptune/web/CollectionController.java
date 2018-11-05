package io.fairspace.neptune.web;

import io.fairspace.neptune.model.Collection;
import io.fairspace.neptune.service.CollectionMetadataService;
import io.fairspace.neptune.service.CollectionService;
import io.fairspace.neptune.service.PermissionService;
import io.fairspace.neptune.web.dto.Permission;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/")
public class CollectionController {
    private final Caching caching;
    private CollectionService collectionService;
    private CollectionMetadataService collectionMetadataService;

    public CollectionController(
            @Value("${cachingPeriod.collection:60}") int cachePeriod,
            CollectionService collectionService,
            CollectionMetadataService collectionMetadataService
    ) {
        this.collectionService = collectionService;
        this.collectionMetadataService = collectionMetadataService;
        this.caching = new Caching(cachePeriod);
    }

    @GetMapping
    public ResponseEntity<Iterable<Collection>> getCollections(@RequestParam(required=false) String location) {
        if(location == null) {
            return ResponseEntity.ok(collectionService.findAll());
        } else {
            return caching.withCacheControl(Collections.singletonList(collectionService.findByLocation(location)));
        }
    }

    @GetMapping(value = "/uri", produces = "application/json")
    public Map<String, String> getUriByLocation(@RequestParam String location) {
        return Collections.singletonMap("uri", collectionMetadataService.getCollectionUriByLocation(location));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Collection> getCollection(@PathVariable Long id) {
        return caching.withCacheControl(collectionService.findById(id));
    }

    @PostMapping
    public ResponseEntity<?> createCollection(@RequestBody Collection collection) throws URISyntaxException, IOException {
        Collection addedCollection = collectionService.add(collection);
        return ResponseEntity.created(new URI(addedCollection.getUri())).build();
    }

    @PatchMapping("/{id}")
    public void patchCollection(@PathVariable Long id, @RequestBody Collection patchedCollection) {
        collectionService.update(id, patchedCollection);
    }

    @DeleteMapping("/{id}")
    public void deleteCollection(@PathVariable Long id) {
        collectionService.delete(id);
    }


}
