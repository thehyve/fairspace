package io.fairspace.saturn.services.views;

import java.util.ArrayList;
import java.util.Hashtable;
import java.util.List;

public class ViewRowCollection {

    private Hashtable<String, List<ViewRow>> data = new Hashtable<String, List<ViewRow>>();

    public ViewRowCollection() {
    }

    public void add(String id, ViewRow row) {
        if (!data.containsKey(id)) {
            data.put(id, new ArrayList<>());
        }
        data.get(id).add(row);
    }

    public List<ViewRow> getRowsForId(String id) {
        return data.get(id);
    }
}
