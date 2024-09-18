package io.fairspace.saturn.config;

import java.util.Arrays;

import jakarta.servlet.FilterConfig;
import lombok.Getter;
import spark.servlet.SparkApplication;
import spark.servlet.SparkFilter;

import io.fairspace.saturn.services.BaseApp;

public class SaturnSparkFilter extends SparkFilter {

    private final BaseApp[] apps;

    @Getter
    private final String[] urls;

    public SaturnSparkFilter(BaseApp... apps) {
        this.apps = apps;
        this.urls = Arrays.stream(apps).map(BaseApp::getBasePath).toArray(String[]::new);
    }

    @Override
    protected SparkApplication[] getApplications(FilterConfig filterConfig) {
        return apps;
    }
}
