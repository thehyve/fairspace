package io.fairspace.neptune.web;

import io.fairspace.neptune.model.Collection;
import io.fairspace.neptune.service.CollectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;

@RestController
@RequestMapping("/")
public class CollectionController {
    @Autowired
    private CollectionService collectionService;

    @GetMapping
    public Iterable<Collection> getCollections() {
        return collectionService.findAll();
    }

    @GetMapping("/{id}")
    public Collection getCollection(@PathVariable Long id) {
        return collectionService.findById(id);
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
