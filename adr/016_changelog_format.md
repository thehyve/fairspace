# Keep track of changes

* **Status**: proposed

* **Context**: 
We need to keep track of changes between releases. 

* **Decision**: 
Functional changes should be tracked in a separate markdown file (CHANGELOG.md).
That file will have the following structure:

```
# Fairspace Changelog

## Changes since version 0.7.0:

### Added:
- A new super cool feature (VRE-1236)
- A new cool feature (VRE-1231)
- A few improvements

### Changed
- Changes in the existing functionality

### Fixed
- Some terrible bug (VRE-1238)
- Some small bug (VRE-1237)
- Some minor bugs (VRE-1230, VRE-1239, VRE-1240)

### Removed
- Some useless feature

## Changes since version 0.7.1:
...

```

Changes should be described from the end-user perspective. 
A user should be able to understand the impact of the changes without going into technical details or looking into Jira tickets.
We should try to keep the list of changes relatively small (e.g. ~20 changes per release). 
Entries should be sorted by importance (most important first), very small changes can be omitted.
The list of changes shouldn't include fixes for bugs introduced *after* a previous release and didn't affect any client.

Every developer should be responsible for adding his changes to the changelog, putting them in the right place according to
their nature (an addition, a fix, etc) and priority.
The reviewer is responsible for checking if all important changes have been mentioned in the changelog.
The release master is responsible for double-checking changelog entries added since previous release and making corrections if needed.
After a new release is built, a new "Changes since version" section including empty sub-chapters should be (automatically?) added to the changelog file.
To keep the changelog from growing too large, information about very old past versions can be removed from time to time.

* **Consequences**:   
We will have an up-to-date and comprehensible changelog.
In the future the changelog will be published on our website and sent to our customers via email subscription.
