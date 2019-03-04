# Webdav implementation

The webdav implementation provided here is based on [milton.io](https://milton.io) and references a [virtual filesystem](../vfs/README.md).

The implementation can be broken down into 2 parts: one part in the `milton` package contains an implementation of the 
required milton interfaces, as well as a servlet exposing webdav. It delegates most work to the virtual filesystem implementation.

`PROPFIND` queries can return custom `http://fairspace.io/ontology#iri` property, containing the IRI of the underlying resource.
To enable this feature add `<allprop/>` tag to the `PROPFIND`'s body:
```xml
<?xml version="1.0" encoding="utf-8" ?>
<propfind xmlns:D="DAV:">
  <allprop/>
</propfind>
```
or explicitly list it in `<D:prop>`:
```xml
<?xml version="1.0" encoding="utf-8" ?>
<D:propfind xmlns:D="DAV:" xmlns:fs="http://fairspace.io/ontology#">
  <D:prop>
    <fs:iri/>
    <D:resourcetype/>
  </D:prop>
```