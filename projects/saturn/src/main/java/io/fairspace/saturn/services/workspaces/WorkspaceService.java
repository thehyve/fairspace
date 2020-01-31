package io.fairspace.saturn.services.workspaces;

import java.io.File;
import java.util.List;
import java.util.stream.Stream;

import static java.util.stream.Collectors.toList;

public class WorkspaceService {
    private final File workspaceRoot;

    public WorkspaceService(File workspaceRoot) {
        this.workspaceRoot = workspaceRoot;
    }

    public List<Workspace> listWorkspaces() {
        return workspaceRoot.exists()
                ? Stream.of(workspaceRoot.list((dir, name) -> !name.equals("lost+found") && !name.startsWith(".")))
                .sorted()
                .map(Workspace::new)
                .collect(toList())
                : List.of();
    }
}
