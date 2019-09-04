package io.fairspace.saturn;

import spark.servlet.SparkApplication;
import spark.servlet.SparkFilter;

import javax.servlet.FilterConfig;
import javax.servlet.ServletException;

import static io.fairspace.saturn.util.PerformanceMeasurer.applyPerformanceMeasuring;
import static spark.Spark.path;

public class SaturnSparkFilter extends SparkFilter {
    private final String basePath;
    private final SparkApplication[] apps;

    public SaturnSparkFilter(String basePath, SparkApplication... apps) {
        this.basePath = basePath;
        this.apps = apps;
    }

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        path(basePath, () -> {
            try {
                super.init(filterConfig);
            } catch (ServletException e) {
                throw new RuntimeException(e);
            }
            applyPerformanceMeasuring();
        });

    }

    @Override
    protected SparkApplication[] getApplications(FilterConfig filterConfig) {
        return apps;
    }
}
