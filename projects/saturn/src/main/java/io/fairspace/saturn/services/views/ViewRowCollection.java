package io.fairspace.saturn.services.views;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ViewRowCollection {

    private Map<String, List<ViewRow>> data = new HashMap<>();

    public ViewRowCollection() {
    }

    public void add(String id, ViewRow row) {
        var value = data.computeIfAbsent(id, x -> new ArrayList<>());
        value.add(row);
    }

    public List<ViewRow> getRowsForId(String id) {
        return data.getOrDefault(id, new ArrayList<ViewRow>());
    }
}
