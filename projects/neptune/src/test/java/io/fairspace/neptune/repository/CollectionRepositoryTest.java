package io.fairspace.neptune.repository;

import io.fairspace.neptune.model.Collection;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.junit4.SpringRunner;

import static org.junit.Assert.*;

@RunWith(SpringRunner.class)
@SpringBootTest
public class CollectionRepositoryTest {

    @Autowired
    CollectionRepository repository;

    @Test(expected = DataIntegrityViolationException.class)
    public void storeEmptyNameFails() {
        Collection collection = Collection.builder()
                .description("description")
                .build();

        Collection saved = repository.save(collection);
    }

    @Test
    public void storeLongDescription() {
        Collection collection = Collection.builder()
                .name("name")
                .description("12345678901234567890123456789012345678901234567890" +
                        "12345678901234567890123456789012345678901234567890" +
                        "12345678901234567890123456789012345678901234567890" +
                        "12345678901234567890123456789012345678901234567890" +
                        "12345678901234567890123456789012345678901234567890" +
                        "12345678901234567890123456789012345678901234567890")
                .build();

        Collection saved = repository.save(collection);

        assertEquals(collection.getDescription(), saved.getDescription());
    }
}