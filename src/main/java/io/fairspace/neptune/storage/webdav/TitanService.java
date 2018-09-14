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

    @Override
    public void addCollection(Collection collection) throws IOException {
        execute(new HttpMkCol(getFullWebdavUrl(collection)));
    }

    @Override
    public void deleteCollection(Collection collection) throws IOException {
        execute(new HttpDelete(getFullWebdavUrl(collection)));
    }

    @Override
    public void moveCollection(Collection collection, String destination) throws IOException {
        HttpMove request = new HttpMove(getFullWebdavUrl(collection));
        request.addHeader("Destination", getFullWebdavUrl(destination));
        request.addHeader("Anticipated-Operation", "true");
        execute(request);
    }

    private void execute(HttpUriRequest request) throws IOException {
        try (CloseableHttpResponse response = httpClient.execute(withAuthorization(request))) {
        }
    }

    private String getFullWebdavUrl(Collection collection) {
        return getFullWebdavUrl(collection.getLocation());
    }

    private String getFullWebdavUrl(String location) {
        return webdavEndpoint + location;
    }

    private HttpUriRequest withAuthorization(HttpUriRequest request) {
        request.addHeader("Authorization", authorizationContainer.getAuthorizationHeader());
        return request;
    }
}
