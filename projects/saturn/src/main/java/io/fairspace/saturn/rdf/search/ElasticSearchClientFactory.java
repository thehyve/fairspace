package io.fairspace.saturn.rdf.search;

import lombok.extern.slf4j.Slf4j;
import org.apache.jena.query.text.es.ESSettings;
import org.elasticsearch.client.Client;
import org.elasticsearch.client.transport.TransportClient;
import org.elasticsearch.common.settings.Settings;
import org.elasticsearch.common.transport.TransportAddress;
import org.elasticsearch.transport.client.PreBuiltTransportClient;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.ArrayList;
import java.util.List;

@Slf4j
public class ElasticSearchClientFactory {
    /**
     * Builds a client for connecting to ES with the given configuration
     *
     * @param esSettings
     * @return
     * @throws UnknownHostException
     * @see org.apache.jena.query.text.es.TextIndexES
     */
    public static Client build(ESSettings esSettings) throws UnknownHostException {
        log.debug("Initializing the Elastic Search Java Client with settings: " + esSettings);
        Settings settings = Settings.builder()
                .put("cluster.name", esSettings.getClusterName()).build();
        List<TransportAddress> addresses = new ArrayList<>();
        for (String host : esSettings.getHostToPortMapping().keySet()) {
            TransportAddress addr = new TransportAddress(InetAddress.getByName(host), esSettings.getHostToPortMapping().get(host));
            addresses.add(addr);
        }

        TransportAddress socketAddresses[] = new TransportAddress[addresses.size()];
        TransportClient tc = new PreBuiltTransportClient(settings);
        tc.addTransportAddresses(addresses.toArray(socketAddresses));
        log.debug("Successfully initialized the client");

        return tc;
    }

}
