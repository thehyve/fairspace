package io.fairspace.neptune.storage.webdav;

import io.fairspace.neptune.config.upstream.AuthorizationContainer;
import io.fairspace.neptune.model.Collection;
import io.fairspace.neptune.service.StorageService;
import lombok.extern.slf4j.Slf4j;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpDelete;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.impl.client.CloseableHttpClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
@Slf4j
public class TitanService implements StorageService {
    private final AuthorizationContainer authorizationContainer;
    private final CloseableHttpClient httpClient;

    @Value("${titan.url}/api/storage/webdav/")
    private String webdavEndpoint;

    @Autowired
    public TitanService(AuthorizationContainer authorizationContainer, CloseableHttpClient httpClient) {
        this.authorizationContainer = authorizationContainer;
        this.httpClient = httpClient;
    }

    public void addCollection(Collection collection) throws IOException {
        execute(withAuthorization(new HttpMkCol(getFullWebdavUrl(collection))));
    }

    public void deleteCollection(Collection collection) throws IOException {
        execute(withAuthorization(new HttpDelete(getFullWebdavUrl(collection))));
    }

    private void execute(HttpUriRequest request) throws IOException {
        try (CloseableHttpResponse response = httpClient.execute(request)) {
        }
    }

    private String getFullWebdavUrl(Collection collection) {
        return webdavEndpoint + collection.getTypeIdentifier();
    }

    private HttpUriRequest withAuthorization(HttpUriRequest request) {
        request.addHeader("Authorization", authorizationContainer.getAuthorizationHeader());
        return request;
    }
}
