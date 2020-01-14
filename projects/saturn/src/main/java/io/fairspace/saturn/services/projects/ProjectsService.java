package io.fairspace.saturn.services.projects;

import java.io.File;
import java.util.List;
import java.util.stream.Stream;

import static java.util.stream.Collectors.toList;

public class ProjectsService {
    private final File projectRoot;

    public ProjectsService(File projectRoot) {
        this.projectRoot = projectRoot;
    }

    public List<Project> listProjects() {
        return projectRoot.exists()
                ? Stream.of(projectRoot.list((dir, name) -> !name.equals("lost+found") && !name.startsWith(".")))
                .sorted()
                .map(Project::new)
                .collect(toList())
                : List.of();
    }
}
