# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)

## [Unreleased]
### Added
- Added OpenAPI documentation on API usage
- Added type and description of shape in vocabulary editor
- 
### Changed
- Performance improvements for metadata editing, vocabulary editing and file operations
- Upgraded JupyterHub to 0.8.2
- Changed webdav library in Jupyter singleuser notebook from [wdfs](https://github.com/jmesmon/wdfs) to [davfs2](https://wiki.archlinux.org/index.php/Davfs2)
- Use ElasticSearch for retrieving and searching the list of metadata
- Extended vocabulary editor to support entities on other domains
- Support identifier inference from shacl:path and shacl:targetClass
- Improved validation on metadata entities
- Show a spinner while loading metadata
- Improved read-only view for metadata and vocabulary entities

### Fixed
- Fixed issues with validation of blank nodes
- Fixed error message after logout
- Fixed handling fields with controlled vocabulary

## [0.6.4] - 2019-05-07
- Initial version to keep track of changes

[Unreleased]: https://github.com/fairspace/workspace/compare/v0.6.4...HEAD
[0.6.4]: https://github.com/fairspace/workspace/tree/v0.6.4
