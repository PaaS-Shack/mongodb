[![Moleculer](https://badgen.net/badge/Powered%20by/Moleculer/0e83cd)](https://moleculer.services)


# MongoDB Databases Service

The MongoDB Databases Service is a [Moleculer](https://moleculer.services/) microservice designed for managing MongoDB databases. This service provides various actions for interacting with MongoDB databases, including querying collection stats, converting collections to capped collections, managing indexes, and dropping databases.

## Table of Contents

- [Dependencies](#dependencies)
- [Service Configuration](#service-configuration)
- [Actions](#actions)
  - [Get Collection Stats](#get-collection-stats)
  - [Convert to Capped Collection](#convert-to-capped-collection)
  - [Get Collection Stats](#get-collection-stats)
  - [Get Collection Indexes](#get-collection-indexes)
  - [Create Collection Index](#create-collection-index)
  - [Drop Collection Index](#drop-collection-index)
  - [Drop Database](#drop-database)
- [Events](#events)
- [Methods](#methods)
- [Lifecycle Event Handlers](#lifecycle-event-handlers)

## Dependencies

- [db-mixin](https://github.com/moleculerjs/moleculer-db): A mixin for Moleculer services to work with databases.
- [membership-mixin](https://github.com/moleculerjs/moleculer-db): A mixin for handling permissions and authentication.
- [config-mixin](https://github.com/moleculerjs/moleculer-db): A mixin for loading configurations.
- [mongodb](https://www.npmjs.com/package/mongodb): A MongoDB driver for Node.js.

## Service Configuration

The MongoDB Databases Service is configured using the following properties:

- `name`: The name of the service, which is "mongodb.databases."
- `version`: The version of the service.
- `mixins`: An array of mixins that extend the service's functionality.
- `dependencies`: An array of service dependencies.
- `settings`: Service-specific settings, including REST endpoint configuration, field definitions, and default configuration settings.
- `actions`: An object defining the service's actions, each with a description, parameters, and a handler function.
- `events`: An empty object for defining service events.
- `methods`: An empty object for defining service methods.
- Lifecycle event handlers (`created`, `started`, and `stopped`) for custom logic when the service is created, started, or stopped.

## Actions

### Get Collection Stats

- **Action Name**: `stats`
- **Description**: Get collection statistics for a MongoDB collection.
- **Parameters**:
  - `id` (String, required): MongoDB server ID.
  - `collStats` (String, optional): MongoDB collection name.
  - `scale` (Number, optional): Scale factor.
- **Returns**: Collection statistics object.

### Convert to Capped Collection

- **Action Name**: `convertToCapped`
- **Description**: Convert a collection to a capped collection.
- **Parameters**:
  - `id` (String, required): MongoDB database ID.
  - `coll` (String, required): MongoDB collection name.
  - `size` (Number, optional): Capped collection size.
  - `max` (Number, optional): Capped collection max size.
- **Returns**: Collection statistics object.

### Get Collection Stats

- **Action Name**: `collStats`
- **Description**: Get collection statistics for a MongoDB collection.
- **Parameters**:
  - `id` (String, required): MongoDB database ID.
  - `coll` (String, required): MongoDB collection name.
- **Returns**: Collection statistics object.

### Get Collection Indexes

- **Action Name**: `indexes`
- **Description**: Get the indexes of a MongoDB collection.
- **Parameters**:
  - `id` (String, required): MongoDB database ID.
  - `coll` (String, required): MongoDB collection name.
- **Returns**: Collection indexes object.

### Create Collection Index

- **Action Name**: `createIndex`
- **Description**: Create an index on a MongoDB collection.
- **Parameters**:
  - `id` (String, required): MongoDB database ID.
  - `coll` (String, required): MongoDB collection name.
  - `index` (Object, required): MongoDB index definition.
- **Returns**: Created index object.

### Drop Collection Index

- **Action Name**: `dropIndex`
- **Description**: Drop an index from a MongoDB collection.
- **Parameters**:
  - `id` (String, required): MongoDB database ID.
  - `coll` (String, required): MongoDB collection name.
  - `name` (String, required): MongoDB index name.
- **Returns**: Dropped index object.

### Drop Database

- **Action Name**: `drop`
- **Description**: Drop a MongoDB database.
- **Parameters**:
  - `id` (String, required): MongoDB database ID.
- **Returns**: Database object after dropping.

## Events

No custom events are defined for this service.

## Methods

No custom methods are defined for this service.

## Lifecycle Event Handlers

- `created()`: An empty function called when the service is created.
- `started()`: An empty function called when the service is started.
- `stopped()`: An empty function called when the service is stopped.

# MongoDB Provisions Service

The MongoDB Provisions Service is a [Moleculer](https://moleculer.services/) microservice designed for managing MongoDB user and database provisioning. This service allows for the creation, packing, and deprovisioning of MongoDB resources for users and databases.

## Table of Contents

- [Dependencies](#dependencies)
- [Service Configuration](#service-configuration)
- [Actions](#actions)
  - [Provision MongoDB Resources](#provision-mongodb-resources)
  - [Pack Provisioned Resources](#pack-provisioned-resources)
  - [Deprovision MongoDB Resources](#deprovision-mongodb-resources)
- [Events](#events)
- [Methods](#methods)
- [Lifecycle Event Handlers](#lifecycle-event-handlers)

## Dependencies

- [db-mixin](https://github.com/moleculerjs/moleculer-db): A mixin for Moleculer services to work with databases.
- [membership-mixin](https://github.com/moleculerjs/moleculer-db): A mixin for handling permissions and authentication.
- [config-mixin](https://github.com/moleculerjs/moleculer-db): A mixin for loading configurations.
- [mongodb](https://www.npmjs.com/package/mongodb): A MongoDB driver for Node.js.
- [generate-password](https://www.npmjs.com/package/generate-password): A package for generating random passwords.

## Service Configuration

The MongoDB Provisions Service is configured using the following properties:

- `name`: The name of the service, which is "mongodb.provisions."
- `version`: The version of the service.
- `mixins`: An array of mixins that extend the service's functionality.
- `dependencies`: An array of service dependencies.
- `settings`: Service-specific settings, including REST endpoint configuration, field definitions, and default configuration settings.
- `actions`: An object defining the service's actions, each with a description, parameters, and a handler function.
- `events`: An empty object for defining service events.
- `methods`: An object containing custom methods used within the service.
- Lifecycle event handlers (`created`, `started`, and `stopped`) for custom logic when the service is created, started, or stopped.

## Actions

### Provision MongoDB Resources

- **Action Name**: `provision`
- **Description**: Provision a new MongoDB user and database.
- **Parameters**:
  - `zone` (String, optional): Zone to provision in.
  - `prefix` (String, optional): Prefix for the provision (default: 'provision').
- **Returns**: Provision object ID.

### Pack Provisioned Resources

- **Action Name**: `pack`
- **Description**: Pack the provisioned MongoDB resources into an object with connection details.
- **Parameters**:
  - `id` (String, required): The provision ID.
- **Returns**: An object with MongoDB connection details.

### Deprovision MongoDB Resources

- **Action Name**: `deprovision`
- **Description**: Deprovision MongoDB resources, including user and database.
- **Parameters**:
  - `id` (String, required): The provision ID.
- **Returns**: The provision object.

## Events

No custom events are defined for this service.

## Methods

### Generate Prefix Name

- **Method Name**: `generatePrefixName(params)`
- **Description**: Generate a prefix name for provisioning based on provided parameters.
- **Parameters**:
  - `params` (Object): Parameters object.
- **Returns**: A prefix name string.

## Lifecycle Event Handlers

- `created()`: An empty function called when the service is created.
- `started()`: An empty function called when the service is started.
- `stopped()`: An empty function called when the service is stopped.


# MongoDB Servers Service

The MongoDB Servers Service is a [Moleculer](https://moleculer.services/) microservice designed for managing MongoDB servers. This service allows for server lookup, retrieval of server information, and various MongoDB server operations.

## Table of Contents

- [Dependencies](#dependencies)
- [Service Configuration](#service-configuration)
- [Actions](#actions)
  - [Lookup Server](#lookup-server)
  - [Get Server Build Info](#get-server-build-info)
  - [Get Server Status](#get-server-status)
  - [List Server Databases](#list-server-databases)
  - [List Server Collections](#list-server-collections)
  - [List Server Users](#list-server-users)
  - [List Server Roles](#list-server-roles)
  - [List Server Privileges](#list-server-privileges)
  - [List Server Commands](#list-server-commands)
  - [List Server Features](#list-server-features)
  - [List Server Logs](#list-server-logs)
  - [List Server Connections](#list-server-connections)
  - [Drop Server Connection](#drop-server-connection)
- [Events](#events)
- [Methods](#methods)
- [Lifecycle Event Handlers](#lifecycle-event-handlers)

## Dependencies

- [db-mixin](https://github.com/moleculerjs/moleculer-db): A mixin for Moleculer services to work with databases.
- [config-mixin](https://github.com/moleculerjs/moleculer-db): A mixin for loading configurations.
- [mongodb.mixin](#): A custom mixin for MongoDB-related operations.
- [mongodb](https://www.npmjs.com/package/mongodb): A MongoDB driver for Node.js.

## Service Configuration

The MongoDB Servers Service is configured using the following properties:

- `name`: The name of the service, which is "mongodb.servers."
- `version`: The version of the service.
- `mixins`: An array of mixins that extend the service's functionality.
- `dependencies`: An array of service dependencies.
- `settings`: Service-specific settings, including REST endpoint configuration, field definitions, and default configuration settings.
- `actions`: An object defining the service's actions, each with a description, parameters, and a handler function.
- `events`: An empty object for defining service events.
- `methods`: An empty object for custom methods used within the service.
- Lifecycle event handlers (`created`, `started`, and `stopped`) for custom logic when the service is created, started, or stopped.

## Actions

### Lookup Server

- **Action Name**: `lookup`
- **Description**: Lookup a MongoDB server for a specific zone.
- **Parameters**:
  - `zone` (String, required): The zone to lookup.
- **Returns**: The server object.

### Get Server Build Info

- **Action Name**: `build`
- **Description**: Get build information for a MongoDB server.
- **Parameters**:
  - `id` (String, required): The MongoDB server ID.
- **Returns**: Build information.

### Get Server Status

- **Action Name**: `status`
- **Description**: Get status information for a MongoDB server.
- **Parameters**:
  - `id` (String, required): The MongoDB server ID.
- **Returns**: Server status.

### List Server Databases

- **Action Name**: `databases`
- **Description**: List databases on a MongoDB server.
- **Parameters**:
  - `id` (String, required): The MongoDB server ID.
- **Returns**: Server databases.

### List Server Collections

- **Action Name**: `collections`
- **Description**: List collections in a specific database on a MongoDB server.
- **Parameters**:
  - `id` (String, required): The MongoDB server ID.
  - `database` (String, required): The MongoDB database name.
- **Returns**: Server collections.

### List Server Users

- **Action Name**: `users`
- **Description**: List users on a MongoDB server.
- **Parameters**:
  - `id` (String, required): The MongoDB server ID.
- **Returns**: Server users.

### List Server Roles

- **Action Name**: `roles`
- **Description**: List roles on a MongoDB server.
- **Parameters**:
  - `id` (String, required): The MongoDB server ID.
- **Returns**: Server roles.

### List Server Privileges

- **Action Name**: `privileges`
- **Description**: List privileges on a MongoDB server.
- **Parameters**:
  - `id` (String, required): The MongoDB server ID.
- **Returns**: Server privileges.

### List Server Commands

- **Action Name**: `commands`
- **Description**: List commands available on a MongoDB server.
- **Parameters**:
  - `id` (String, required): The MongoDB server ID.
- **Returns**: Server commands.

### List Server Features

- **Action Name**: `features`
- **Description**: List features available on a MongoDB server.
- **Parameters**:
  - `id` (String, required): The MongoDB server ID.
- **Returns**: Server features.

### List Server Logs

- **Action Name**: `logs`
- **Description**: List logs from a MongoDB server.
- **Parameters**:
  - `id` (String, required): The MongoDB server ID.
  - `filter` (Object, optional): MongoDB server logs filter.
- **Returns**: Server logs.

### List Server Connections

- **Action Name**: `connections`
- **Description**: List current connections to a MongoDB server.
- **Parameters**:
  - `id` (String, required): The MongoDB server ID.
- **Returns**: Server connections.

### Drop Server Connection

- **Action Name**: `dropConnection`
- **Description**: Drop a specific connection to a MongoDB server.
- **Parameters**:
  - `id` (String, required): The MongoDB server ID.
  - `host` (String, required): MongoDB client host.
  - `port` (Number, required): MongoDB client port.
- **Returns**: Server connections.

## Events

No custom events are defined for this service.

## Methods

No custom methods are defined for this service.

## Lifecycle Event Handlers

- `created()`: An empty function called when the service is created.
- `started()`: An empty function called when the service is started.
- `stopped()`: An empty function called when the service is stopped.


# MongoDB Users Service

This service manages MongoDB users in a Moleculer application. It integrates with various mixins and handles MongoDB interactions.

## Mixins

- `DbService`: Provides general database service functionality, including CRUD operations.
- `Membership`: Handles user authentication and authorization.
- `ConfigLoader`: Loads configuration settings for the service.
- `MongoMixin`: Custom mixin for MongoDB-specific functionality.

## Service Settings

- `name`: Name of the service.
- `version`: Version number of the service.
- `mixins`: List of mixins used by the service.
- `settings`: Configuration options for the service, including REST endpoints, fields for MongoDB users, scopes, and more.

## Actions

### `info`

- **Description**: Get MongoDB user information.
- **Parameters**:
  - `id`: MongoDB user ID.
- **Returns**: MongoDB user object.

### `createNotFound`

- **Description**: Create a MongoDB user if not found.
- **Parameters**:
  - `id`: MongoDB user ID.
- **Returns**: MongoDB user object.

### `drop`

- **Description**: Drop a MongoDB user.
- **Parameters**:
  - `id`: MongoDB user ID.
- **Returns**: MongoDB user object.

### `grantRoles`

- **Description**: Grant roles to a MongoDB user.
- **Parameters**:
  - `id`: MongoDB user ID.
  - `roles`: Array of roles to grant.
- **Returns**: MongoDB user object.

### `revokeRoles`

- **Description**: Revoke roles from a MongoDB user.
- **Parameters**:
  - `id`: MongoDB user ID.
  - `roles`: Array of roles to revoke.
- **Returns**: MongoDB user object.

## Events

### `v1.mongodb.users.created`

- **Description**: Triggered when a MongoDB user is created. Performs additional actions related to user creation.

## Methods

- `createUser`: Create a MongoDB user.
- `updateUser`: Update a MongoDB user.
- `deleteUser`: Delete a MongoDB user.
- `getUserInfo`: Get information about a MongoDB user.
- `grantRoles`: Grant roles to a MongoDB user.
- `revokeRoles`: Revoke roles from a MongoDB user.

## Lifecycle Event Handlers

- `created`: Called when the service is created.
- `started`: Called when the service is started.
- `stopped`: Called when the service is stopped.

## Useful links

* Moleculer website: https://moleculer.services/
* Moleculer Documentation: https://moleculer.services/docs/0.14/

## NPM scripts

- `npm run dev`: Start development mode (load all services locally with hot-reload & REPL)
- `npm run start`: Start production mode (set `SERVICES` env variable to load certain services)
- `npm run cli`: Start a CLI and connect to production. Don't forget to set production namespace with `--ns` argument in script
- `npm run lint`: Run ESLint
- `npm run ci`: Run continuous test mode with watching
- `npm test`: Run tests & generate coverage report
- `npm run dc:up`: Start the stack with Docker Compose
- `npm run dc:down`: Stop the stack with Docker Compose
