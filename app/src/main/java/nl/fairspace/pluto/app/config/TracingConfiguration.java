package nl.fairspace.pluto.app.config;

import com.netflix.zuul.context.RequestContext;
import org.springframework.cloud.sleuth.SpanAdjuster;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Map;

@Configuration
public class TracingConfiguration {

    public static final String HTTP_METHOD_TAG = "http.method";
    public static final String HTTP_PATH_TAG = "http.path";

    @Bean
    SpanAdjuster spanAdjuster() {
        // The zuul filter does not add the route to the span name
        // where it would be useful
        return span -> {
            Map<String, String> tags = span.tags();
            RequestContext currentContext = RequestContext.getCurrentContext();

            if(currentContext != null &&
                    currentContext.getBoolean("zuulEngineRan", false) &&
                    tags.containsKey(HTTP_METHOD_TAG) &&
                    span.name().equalsIgnoreCase(tags.get(HTTP_METHOD_TAG))) {

                return span.toBuilder().name(String.format("%s %s", tags.get(HTTP_METHOD_TAG), currentContext.get("proxy"))).build();
            } else {
                return span;
            }
        };
    }
}

