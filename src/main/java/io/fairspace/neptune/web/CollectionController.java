package io.fairspace.neptune.web;

import io.fairspace.neptune.model.Collection;
import io.fairspace.neptune.service.CollectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/collections")
public class CollectionController {
    @Autowired
    private CollectionService collectionService;

    @GetMapping
    public List<Collection> getCollections() {
        return collectionService.getCollections();
    }

    @PostMapping
    public void createCollection(@RequestBody Collection collection) {
        collectionService.createCollection(collection);
    }
}
