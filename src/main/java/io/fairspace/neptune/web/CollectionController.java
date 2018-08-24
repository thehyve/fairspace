package io.fairspace.neptune.web;

import io.fairspace.neptune.model.Collection;
import io.fairspace.neptune.service.CollectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Optional;

@RestController
@RequestMapping("/collections")
public class CollectionController {
    @Autowired
    private CollectionService collectionService;

    @GetMapping
    public Iterable<Collection> getCollections() {
        return collectionService.findAll();
    }

    @GetMapping("/{id}")
    public Collection getCollection(@PathVariable Long id) {
        return collectionService.findById(id)
                .orElseThrow(CollectionNotFoundException::new);
    }

    @PostMapping
    public ResponseEntity<?> createCollection(@RequestBody Collection collection) throws URISyntaxException, IOException {
        Collection addedCollection = collectionService.add(collection);

        // Determine the URI for this collection
        URI uri = null;

        if(addedCollection.getMetadata() != null) {
            uri = new URI(addedCollection.getMetadata().getUri());
        }

        return ResponseEntity.created(uri).build();
    }

    @PatchMapping("/{id}")
    public void patchCollection(@PathVariable Long id, @RequestBody Collection patchedCollection) {
        collectionService.update(id, patchedCollection);
    }

    @DeleteMapping("/{id}")
    public void deleteCollection(@PathVariable Long id) {
        collectionService.deleteById(id);
    }


}
