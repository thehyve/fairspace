# Keep track of changes

* **Status**: proposed

* **Context**: 
We need to keep track of changes between releases. 

* **Decision**: 
Functional changes should be tracked in a separate markdown file (CHANGELOG.md).
That file will have the format and follow the principles defined at [keep a changelog](https://keepachangelog.com/en/1.1.0/).

Changes should be described mostly from the end-user perspective. Important architectural and non functional changes can be mentioned as well. To make it clear that those changes don't affect any functionality, I'd propose to tag them with word `Infastructural`, e.g. `- (Infastructural) Logging improvements`. (The word `non-functional` might be confusing for some users).
A user should be able to understand the impact of the changes without going into technical details or looking into Jira tickets.
We should try to keep the list of changes relatively small (e.g. ~20 changes per release). 
Entries should be sorted by importance (most important first), very small changes can be omitted.
The list of changes shouldn't include fixes for bugs which were introduced *after* a previous release and didn't affect any client.

Every developer should be responsible for adding his changes to the changelog, putting them in the right place according to
their nature (an addition, a fix, etc) and priority.
The reviewer is responsible for checking if all important changes have been mentioned in the changelog.
The release master is responsible for double-checking changelog entries added since previous release and making corrections if needed.
After a new release is built, a new `Unreleased` section including empty sub-chapters should be (automatically?) added to the changelog file.
To keep the changelog from growing too large, information about very old past versions can be removed from time to time.

* **Consequences**:   
We will have an up-to-date and comprehensible changelog.
In the future the changelog will be published on our website and sent to our customers via email subscription.
