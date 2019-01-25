# Virtual file system implementation

This package provides a virtual file system implementation. The implementation consists of
2 parts:
* **Resources** represent the directory structure of the filesystem. It consists of files and directories and their relation.
* **Content** represent the contents of the files

NB. The resources in a VFS must not be confused with either a Resource in RDF or a Resource in Milton, even though 
they may coincide (depending on the actual implementation)

For both parts of the VFS there can be several implementations. The resources can be stored in a database or actually
mimicking the actual filesystem. The contents of the files can be stored on a local filesystem, in a database or in an
S3 bucket. The relation between the file resource and its contents is specified by its `contentLocation` property.

The current implementation include:
* an Rdf implementation for the resources that stores the virtual file system structure in a triple store using `Apache Jena`
* an immutable local storage implementation that stores every new version of a file on the local filesystem. When a file is overwritten,
  it is stored apart from its previous version, which remains available on disk.    
