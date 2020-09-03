package io.fairspace.saturn.webdav;

import io.milton.http.FileItem;
import io.milton.http.RequestParseException;
import io.milton.servlet.ServletRequest;

import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

import static io.milton.http.ResourceHandlerHelper.ATT_NAME_FILES;
import static io.milton.http.ResourceHandlerHelper.ATT_NAME_PARAMS;

public class PreParsedServletRequest extends ServletRequest {

    public PreParsedServletRequest(HttpServletRequest request) throws RequestParseException {
        super(request, request.getServletContext());

        var params = new HashMap<String, String>();
        var files = new HashMap<String, FileItem>();
        super.parseRequestParameters(params, files);
        getAttributes().put(ATT_NAME_PARAMS, params);
        getAttributes().put(ATT_NAME_FILES, files);
    }

    @Override
    public void parseRequestParameters(Map<String, String> params, Map<String, FileItem> files) throws RequestParseException {
       params.putAll(getParams());
       files.putAll(getFiles());
    }
}
