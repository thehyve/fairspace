package io.fairspace.saturn.config;

import jakarta.servlet.FilterConfig;
import spark.servlet.SparkApplication;
import spark.servlet.SparkFilter;

public class SaturnSparkFilter extends SparkFilter {
    private final SparkApplication[] apps;

    public SaturnSparkFilter(SparkApplication... apps) {
        this.apps = apps;
    }

    @Override
    protected SparkApplication[] getApplications(FilterConfig filterConfig) {
        return apps;
    }
}
