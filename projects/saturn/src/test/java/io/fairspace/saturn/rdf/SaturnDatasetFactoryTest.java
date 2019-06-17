package io.fairspace.saturn.rdf;

import io.fairspace.saturn.Config;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.TemporaryFolder;
import org.junit.runner.RunWith;
import org.mockito.junit.MockitoJUnitRunner;

import java.io.File;
import java.io.IOException;

import static org.junit.Assert.*;

@RunWith(MockitoJUnitRunner.class)
public class SaturnDatasetFactoryTest {
    @Rule
    public TemporaryFolder testFolder = new TemporaryFolder();

    @Test
    public void testIsRestoreNeededForEmptyDirectory() throws IOException {
        File emptyDirectory = testFolder.newFolder();
        assertTrue(SaturnDatasetFactory.isRestoreNeeded(emptyDirectory));
    }

    @Test
    public void testIsRestoreNeededForNonExistingDirectory() throws IOException {
        File nonExistentDirectory = new File(testFolder.getRoot(), "non-existent-directory");
        assertTrue(SaturnDatasetFactory.isRestoreNeeded(nonExistentDirectory));
    }

    @Test
    public void testIsRestoreNotNeededForFilledDirectory() throws IOException {
        File datasetPath = testFolder.newFolder();
        new File(datasetPath, "database.tdb").createNewFile();
        assertFalse(SaturnDatasetFactory.isRestoreNeeded(datasetPath));
    }
}
