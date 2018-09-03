package io.fairspace.neptune.web;

import io.fairspace.neptune.model.Collection;
import io.fairspace.neptune.service.CollectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.security.Principal;

@RestController
@RequestMapping("/")
public class CollectionController {
    @Autowired
    private CollectionService collectionService;

    @GetMapping
    public Iterable<Collection> getCollections(Principal principal) {
        return collectionService.findAll(principal.getName());
    }

    @GetMapping("/{id}")
    public Collection getCollection(@PathVariable Long id, Principal principal) {
        return collectionService.findById(id, principal.getName())
                .orElseThrow(CollectionNotFoundException::new);
    }

    @PostMapping
    public ResponseEntity<?> createCollection(@RequestBody Collection collection, Principal principal) throws URISyntaxException, IOException {
        Collection addedCollection = collectionService.add(collection, principal.getName());

        // Determine the URI for this collection
        URI uri = null;

        if(addedCollection.getMetadata() != null) {
            uri = new URI(addedCollection.getMetadata().getUri());
        }

        return ResponseEntity.created(uri).build();
    }

    @PatchMapping("/{id}")
    public void patchCollection(@PathVariable Long id, @RequestBody Collection patchedCollection, Principal principal) {
        collectionService.update(id, patchedCollection, principal.getName());
    }

    @DeleteMapping("/{id}")
    public void deleteCollection(@PathVariable Long id, Principal principal) {
        collectionService.deleteById(id, principal.getName());
    }


}
