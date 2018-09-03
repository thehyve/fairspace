package io.fairspace.neptune.metadata.ceres;

import com.github.tomakehurst.wiremock.junit.WireMockClassRule;
import org.apache.jena.rdf.model.Model;
import org.junit.Before;
import org.junit.ClassRule;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.cloud.contract.wiremock.WireMockSpring;
import org.springframework.web.client.RestTemplate;

import static com.github.tomakehurst.wiremock.client.WireMock.*;
import static org.junit.Assert.assertFalse;

@RunWith(MockitoJUnitRunner.class)
public class CeresServiceTest {
    private CeresService ceresService;

    @ClassRule
    public static WireMockClassRule wiremock = new WireMockClassRule(
            WireMockSpring.options().dynamicPort());

    @Before
    public void setUp() throws Exception {
        serveCeres();

        RestTemplate restTemplate = new RestTemplate();
        restTemplate.getMessageConverters().add(new JsonldModelConverter());

        ceresService = new CeresService(
                restTemplate,
                "http://localhost:" + wiremock.port() + "/ceres/statements",
                "http://localhost:" + wiremock.port() + "/ceres/query");
    }

    @Test
    public void test() {
        Model model = ceresService.retrieveTriples("http://test.nl");
        assertFalse(model.isEmpty());
    }

    private void serveCeres() {
        // Setup wiremock endpoint to return keyset
        wiremock.stubFor(get(urlPathMatching("^/ceres/statements"))
                .willReturn(
                        aResponse()
                                .withHeader("Content-Type", "application/ld+json")
                                .withBody("{\n" +
                                        "  \"@context\": \"http://schema.org\",\n" +
                                        "  \"@type\": \"Book\",\n" +
                                        "  \"name\": \"Semantic Web Primer (First Edition)\",\n" +
                                        "  \"publisher\": \"Linked Data Tools\",\n" +
                                        "  \"inLanguage\": \"English\"}")));
    }



}