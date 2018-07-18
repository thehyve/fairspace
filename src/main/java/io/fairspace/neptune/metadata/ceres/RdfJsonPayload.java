package io.fairspace.neptune.metadata.ceres;

import org.springframework.util.LinkedMultiValueMap;

import java.net.URI;
import java.util.LinkedHashMap;

public class RdfJsonPayload extends LinkedHashMap<String, LinkedMultiValueMap<URI, RdfObject>> { }
