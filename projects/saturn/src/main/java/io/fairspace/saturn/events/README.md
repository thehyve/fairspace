# Events
This application is able to emit several events onto an AMQP message bus (e.g. RabbitMQ). 

## Routing keys
The routing keys for all messages consist of 3 parts, separated by a dot (`.`):
* workspace identifier indicating the workspace that this event occurred in.
* event category (either `permission`, `collection`,`file`, `metadata` or `vocabulary`) indicating the category of events. See [`EventCategory` class](./EventCategory.java) for more information
* event type indicating the type of event that occurred. The supported types depend on the category:
  * [category `permission`](./PermissionEvent.java): `resource_created`, `updated`, `deleted`
  * [category `collection`](./CollectionEvent.java): `created`, `updated`, `moved`, `deleted`
  * [category `file_system`](./FileSystemEvent.java): `directory_created`, `listed`, `copied`, `moved`, `deleted`, `file_read`, `file_written`
  * [category `metadata`](./MetadataEvent.java) or [category `vocabulary`](./MetadataEvent.java): `created`, `updated`, `deleted`, `soft_deleted`

## Message contents
Each message consists of a UTF-8 encoded JSON body. Each JSON object represents an [EventContainer](./EventContainer.java), with
* a [`user`](./User.java) (with `id`, `username` and `name`) representing the user that is logged in
* a `workspace` representing the workspace identifier for the current workspace
* an `event`, representing the actual event that occurred. The actual contents of the event depend
  on the category.
