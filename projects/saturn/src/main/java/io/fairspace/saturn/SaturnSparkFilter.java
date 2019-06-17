package io.fairspace.saturn;

import io.fairspace.saturn.util.PerformanceMeasurer;
import spark.servlet.SparkApplication;
import spark.servlet.SparkFilter;

import javax.servlet.FilterConfig;
import javax.servlet.ServletException;

public class SaturnSparkFilter extends SparkFilter {
    private final SparkApplication[] apps;

    public SaturnSparkFilter(SparkApplication... apps) {
        this.apps = apps;
    }

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        super.init(filterConfig);
        PerformanceMeasurer.applyPerformanceMeasuring();
    }

    @Override
    protected SparkApplication[] getApplications(FilterConfig filterConfig) {
        return apps;
    }
}
