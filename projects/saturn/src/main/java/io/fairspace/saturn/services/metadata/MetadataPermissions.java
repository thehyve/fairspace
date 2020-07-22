package io.fairspace.saturn.services.metadata;

import io.fairspace.saturn.services.workspaces.WorkspaceService;
import io.fairspace.saturn.services.workspaces.WorkspaceStatus;
import io.fairspace.saturn.vocabulary.FS;
import io.fairspace.saturn.webdav.DavFactory;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.vocabulary.RDF;

import static io.fairspace.saturn.auth.RequestContext.*;

public class MetadataPermissions {
    private final WorkspaceService workspaceService;
    private final DavFactory davFactory;

    public MetadataPermissions(WorkspaceService workspaceService, DavFactory davFactory) {
        this.workspaceService = workspaceService;
        this.davFactory = davFactory;
    }

    public boolean canReadMetadata(Resource resource) {
        if (isAdmin()) {
            return true;
        }
        if (davFactory.isFileSystemResource(resource)) {
            return davFactory.getAccess(resource).canList();
        }
        if (resource.hasProperty(RDF.type, FS.Workspace)) {
            var ws = workspaceService.getWorkspace(resource.asNode());
            return ws.isCanCollaborate();
        }
        return canViewPublicMetadata();
    }

    public boolean canWriteMetadata(Resource resource) {
        if (isAdmin()) {
            return true;
        }
        if (davFactory.isFileSystemResource(resource)) {
            return davFactory.getAccess(resource).canWrite();
        }
        if (resource.hasProperty(RDF.type, FS.Workspace)) {
            var ws = workspaceService.getWorkspace(resource.asNode());
            return ws.isCanManage() && ws.getStatus() == WorkspaceStatus.Active;
        }
        return canAddSharedMetadata();
    }
}
