package io.fairspace.saturn.config;

import spark.servlet.SparkApplication;
import spark.servlet.SparkFilter;

import javax.servlet.FilterConfig;

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
