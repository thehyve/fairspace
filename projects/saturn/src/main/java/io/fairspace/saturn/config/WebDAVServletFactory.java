package io.fairspace.saturn.config;

import io.fairspace.saturn.rdf.transactions.RDFLink;
import io.fairspace.saturn.vfs.CompoundFileSystem;
import io.fairspace.saturn.vfs.irods.IRODSVirtualFileSystem;
import io.fairspace.saturn.vfs.managed.LocalBlobStore;
import io.fairspace.saturn.vfs.managed.ManagedFileSystem;
import io.fairspace.saturn.webdav.MiltonWebDAVServlet;
import io.fairspace.saturn.webdav.WebdavEventEmitter;

import javax.servlet.http.HttpServlet;
import java.io.File;
import java.util.Map;

import static io.fairspace.saturn.ThreadContext.getThreadContext;

public class WebDAVServletFactory {
    public static HttpServlet initWebDAVServlet(String webDavPathPrefix, RDFLink rdfLink, Services svc, Config.WebDAV config) throws Exception {
        var blobStore = new LocalBlobStore(new File(config.blobStorePath));
        var fs = new CompoundFileSystem(svc.getCollectionsService(), Map.of(
                ManagedFileSystem.TYPE, new ManagedFileSystem(rdfLink, blobStore, () -> svc.getUserService().getUserIri(getThreadContext().getUserInfo().getSubjectClaim()), svc.getCollectionsService(), svc.getEventBus()),
                IRODSVirtualFileSystem.TYPE, new IRODSVirtualFileSystem(rdfLink, svc.getCollectionsService())));

        return new MiltonWebDAVServlet(webDavPathPrefix, fs, new WebdavEventEmitter(svc.getEventService()));
    }
}
