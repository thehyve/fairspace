package io.fairspace.saturn.config;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum Feature {
    @JsonProperty("ExtraStorage")
    ExtraStorage,

    @JsonProperty("LlmSearch")
    LlmSearch
}
