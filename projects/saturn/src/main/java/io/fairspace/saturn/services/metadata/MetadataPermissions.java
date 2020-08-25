package io.fairspace.saturn.services.metadata;

import io.fairspace.saturn.services.users.UserService;
import io.fairspace.saturn.services.workspaces.WorkspaceService;
import io.fairspace.saturn.vocabulary.FS;
import io.fairspace.saturn.webdav.DavFactory;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.vocabulary.RDF;

import static io.fairspace.saturn.auth.RequestContext.*;

public class MetadataPermissions {
    private final WorkspaceService workspaceService;
    private final DavFactory davFactory;
    private final UserService userService;

    public MetadataPermissions(WorkspaceService workspaceService, DavFactory davFactory, UserService userService) {
        this.workspaceService = workspaceService;
        this.davFactory = davFactory;
        this.userService = userService;
    }

    public boolean canReadMetadata(Resource resource) {
        if (isSuperAdmin()) {
            return true;
        }
        if (davFactory.isFileSystemResource(resource)) {
            return davFactory.getAccess(resource).canList();
        }
        if (resource.hasProperty(RDF.type, FS.Workspace)) {
            var ws = workspaceService.getWorkspace(resource.asNode());
            return ws.isCanCollaborate();
        }
        return userService.currentUser().getSuperadmin();
    }

    public boolean canWriteMetadata(Resource resource) {
        if (isSuperAdmin()) {
            return true;
        }
        if (davFactory.isFileSystemResource(resource)) {
            return davFactory.getAccess(resource).canWrite();
        }
        if (resource.hasProperty(RDF.type, FS.Workspace)) {
            var ws = workspaceService.getWorkspace(resource.asNode());
            return ws.isCanManage();
        }
        return userService.currentUser().isViewPublicMetadata();
    }
}
