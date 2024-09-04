package io.fairspace.saturn.config;

import io.fairspace.saturn.services.BaseApp;
import jakarta.servlet.FilterConfig;
import lombok.Getter;
import spark.servlet.SparkApplication;
import spark.servlet.SparkFilter;

import java.util.Arrays;

public class SaturnSparkFilter extends SparkFilter {

    private final BaseApp[] apps;

    @Getter
    private final String[] urls;

    public SaturnSparkFilter(BaseApp... apps) {
        this.apps = apps;
        this.urls = Arrays.stream(apps)
                .map(BaseApp::getBasePath)
                .toArray(String[]::new);
    }

    @Override
    protected SparkApplication[] getApplications(FilterConfig filterConfig) {
        return apps;
    }
}
