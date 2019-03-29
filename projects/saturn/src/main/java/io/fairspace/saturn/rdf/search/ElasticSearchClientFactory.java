package io.fairspace.saturn.rdf.search;

import io.fairspace.saturn.Config;
import lombok.extern.slf4j.Slf4j;
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
     * @param configuration
     * @return
     * @throws UnknownHostException
     * @see org.apache.jena.query.text.es.TextIndexES
     */
    public static Client build(Config.Jena.ElasticSearch configuration) throws UnknownHostException {
        log.debug("Initializing the Elastic Search Java Client with settings: " + configuration.settings);
        Settings settings = Settings.builder()
                .put("cluster.name", configuration.settings.getClusterName()).build();
        List<TransportAddress> addresses = new ArrayList<>();
        for (String host : configuration.settings.getHostToPortMapping().keySet()) {
            TransportAddress addr = new TransportAddress(InetAddress.getByName(host), configuration.settings.getHostToPortMapping().get(host));
            addresses.add(addr);
        }

        TransportAddress socketAddresses[] = new TransportAddress[addresses.size()];
        TransportClient tc = new PreBuiltTransportClient(settings);
        tc.addTransportAddresses(addresses.toArray(socketAddresses));
        log.debug("Successfully initialized the client");

        return tc;
    }

}
