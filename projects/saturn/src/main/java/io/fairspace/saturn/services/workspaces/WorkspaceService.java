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
        // TODO: reimplement
        return null;
    }
}
