package io.fairspace.saturn;

import spark.servlet.SparkFilter;

import javax.servlet.Filter;
import javax.servlet.FilterConfig;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import java.util.Enumeration;

public class SaturnFilterFactory {
    public static Filter create() throws ServletException {
        var filter = new SparkFilter();
        var config = new FilterConfig() {
            @Override
            public String getFilterName() {
                return null;
            }

            @Override
            public ServletContext getServletContext() {
                return null;
            }

            @Override
            public String getInitParameter(String name) {
                return null;
            }

            @Override
            public Enumeration<String> getInitParameterNames() {
                return null;
            }
        };
        filter.init(config);
        return filter;
    }
}
