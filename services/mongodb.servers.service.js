"use strict";



const DbService = require("db-mixin");
const Membership = require("membership-mixin");
const ConfigLoader = require("config-mixin");

const { MoleculerClientError } = require("moleculer").Errors;

const MongoMixin = require("../mixins/mongodb.mixin");


/**
 * this service maanges mongodb servers
 */
module.exports = {
    name: "mongodb.servers",
    version: 1,

    mixins: [
        DbService({
            permissions: "mongodb.servers",
        }),
        ConfigLoader(['mongodb.**']),
        MongoMixin
    ],

    /**
     * Service dependencies
     */
    dependencies: [

    ],

    /**
     * Service settings
     */
    settings: {
        rest: "/v1/mongodb/servers/",

        fields: {

            // mongodb server name
            name: {
                type: "string",
                required: true,
                //unique: true,
                min: 3,
                max: 50,
                trim: true,
                lowercase: true,
                index: true,
                searchable: true,
                description: "mongodb server name"
            },

            // mongodb server host
            host: {
                type: "string",
                required: true,
                min: 3,
                max: 50,
                trim: true,
                lowercase: true,
                index: true,
                searchable: true,
                description: "mongodb server host"
            },

            // mongodb server port
            port: {
                type: "number",
                required: true,
                min: 1,
                max: 65535,
                description: "mongodb server port"
            },

            // mongodb server url
            url: {
                type: "string",
                required: false,
                min: 3,
                max: 50,
                trim: true,
                lowercase: true,
                index: true,
                searchable: true,
                description: "mongodb server url"
            },

            // mongodb server root user object id
            root: {
                type: "string",
                required: true,
                description: "mongodb server root user object id",
                populate: {
                    action: "v1.mongodb.users.resolve",
                }
            },




            ...DbService.FIELDS,// inject dbservice fields
        },
        defaultPopulates: [
            "root"
        ],

        scopes: {
            ...DbService.SCOPE,
        },

        defaultScopes: [
            ...DbService.DSCOPE,
        ],

        // default init config settings
        config: {

        }
    },

    /**
     * Actions
     */

    actions: {
        /**
         * get build info
         * 
         * @actions
         * @param {String} id - mongodb server id
         * 
         * @returns {Object} server build info
         */
        build: {
            rest: {
                method: "GET",
                path: "/:id/build",
            },
            permissions: ['mongodb.servers.build'],
            params: {
                id: {
                    type: "string",
                    optional: false,
                    description: "mongodb server id",
                }
            },
            async handler(ctx) {
                // get server
                const server = await this.resolve(ctx, ctx.params.id);

                // get client
                const client = await this.getClient(ctx, server);

                // get build info
                const buildInfo = await client.db("admin").command({ buildInfo: 1 });

                return buildInfo;
            }
        },

        /**
         * get server status
         * 
         * @actions
         * @param {String} id - mongodb server id
         * 
         * @returns {Object} server status
         */
        status: {
            rest: {
                method: "GET",
                path: "/:id/status",
            },
            permissions: ['mongodb.servers.status'],
            params: {
                id: {
                    type: "string",
                    optional: false,
                    description: "mongodb server id",
                }
            },
            async handler(ctx) {
                const params = Object.assign({}, ctx.params);

                // get server
                const server = await ctx.call("v1.mongodb.servers.resolve", params);

                //check if server exists
                if (!server) {
                    throw new MoleculerClientError("Server not found", 404, "SERVER_NOT_FOUND", { id: params.id });
                }

                // get client
                const client = await this.getClient(ctx, server);

                // get server status
                const serverStatus = await client.db("admin").command({ serverStatus: 1 });

                return serverStatus;
            }
        },

        /**
         * list server databases
         * 
         * @actions
         * @param {String} id - mongodb server id
         * 
         * @returns {Object} server databases
         */
        databases: {
            rest: {
                method: "GET",
                path: "/:id/databases",
            },
            permissions: ['mongodb.servers.databases'],
            params: {
                id: {
                    type: "string",
                    optional: false,
                    description: "mongodb server id",
                }
            },
            async handler(ctx) {
                const params = Object.assign({}, ctx.params);

                // get server
                const server = await ctx.call("v1.mongodb.servers.resolve", params);

                //check if server exists
                if (!server) {
                    throw new MoleculerClientError("Server not found", 404, "SERVER_NOT_FOUND", { id: params.id });
                }

                // get client
                const client = await this.getClient(ctx, server);

                // get server databases
                const databases = await client.db("admin").command({ listDatabases: 1 });

                return databases;
            }
        },

        /**
         * list server collections
         * 
         * @actions
         * @param {String} id - mongodb server id
         * @param {String} database - mongodb database name
         * 
         * @returns {Object} server collections
         */
        collections: {
            rest: {
                method: "GET",
                path: "/:id/databases/:database/collections",
            },
            permissions: ['mongodb.servers.collections'],
            params: {
                id: {
                    type: "string",
                    optional: false,
                    description: "mongodb server id",
                },
                database: {
                    type: "string",
                    optional: false,
                    description: "mongodb database name",
                }
            },
            async handler(ctx) {
                const params = Object.assign({}, ctx.params);

                // get server
                const server = await ctx.call("v1.mongodb.servers.resolve", params);

                //check if server exists
                if (!server) {
                    throw new MoleculerClientError("Server not found", 404, "SERVER_NOT_FOUND", { id: params.id });
                }

                // get client
                const client = await this.getClient(ctx, server);

                // get server collections
                const collections = await client.db(params.database).listCollections().toArray();

                return collections;
            }
        },

        /**
         * list server users
         * 
         * @actions
         * @param {String} id - mongodb server id
         * 
         * @returns {Object} server users
         */
        users: {
            rest: {
                method: "GET",
                path: "/:id/users",
            },
            permissions: ['mongodb.servers.users'],
            params: {
                id: {
                    type: "string",
                    optional: false,
                    description: "mongodb server id",
                }
            },
            async handler(ctx) {
                const params = Object.assign({}, ctx.params);

                // get server
                const server = await ctx.call("v1.mongodb.servers.resolve", params);

                //check if server exists
                if (!server) {
                    throw new MoleculerClientError("Server not found", 404, "SERVER_NOT_FOUND", { id: params.id });
                }

                // get client
                const client = await this.getClient(ctx, server);

                // get server users
                const users = await client.db("admin").command({ usersInfo: 1 });

                return users;
            }
        },

        /**
         * list server roles
         * 
         * @actions
         * @param {String} id - mongodb server id
         * 
         * @returns {Object} server roles
         */
        roles: {
            rest: {
                method: "GET",
                path: "/:id/roles",
            },
            permissions: ['mongodb.servers.roles'],
            params: {
                id: {
                    type: "string",
                    optional: false,
                    description: "mongodb server id",
                }
            },
            async handler(ctx) {
                const params = Object.assign({}, ctx.params);

                // get server
                const server = await ctx.call("v1.mongodb.servers.resolve", params);

                //check if server exists
                if (!server) {
                    throw new MoleculerClientError("Server not found", 404, "SERVER_NOT_FOUND", { id: params.id });
                }

                // get client
                const client = await this.getClient(ctx, server);

                // get server roles
                const roles = await client.db("admin").command({ rolesInfo: 1 });

                return roles;
            }
        },

        /**
         * list server privileges
         * 
         * @actions
         * @param {String} id - mongodb server id
         * 
         * @returns {Object} server privileges
         */
        privileges: {
            rest: {
                method: "GET",
                path: "/:id/privileges",
            },
            permissions: ['mongodb.servers.privileges'],
            params: {
                id: {
                    type: "string",
                    optional: false,
                    description: "mongodb server id",
                }
            },
            async handler(ctx) {
                const params = Object.assign({}, ctx.params);

                // get server
                const server = await ctx.call("v1.mongodb.servers.resolve", params);

                //check if server exists
                if (!server) {
                    throw new MoleculerClientError("Server not found", 404, "SERVER_NOT_FOUND", { id: params.id });
                }

                // get client
                const client = await this.getClient(ctx, server);

                // get server privileges
                const privileges = await client.db("admin").command({ privilegesInfo: 1 });

                return privileges;
            }
        },

        /**
         * list server commands
         * 
         * @actions
         * @param {String} id - mongodb server id
         * 
         * @returns {Object} server commands
         */
        commands: {
            rest: {
                method: "GET",
                path: "/:id/commands",
            },
            permissions: ['mongodb.servers.commands'],
            params: {
                id: {
                    type: "string",
                    optional: false,
                    description: "mongodb server id",
                }
            },
            async handler(ctx) {
                const params = Object.assign({}, ctx.params);

                // get server
                const server = await ctx.call("v1.mongodb.servers.resolve", params);

                //check if server exists
                if (!server) {
                    throw new MoleculerClientError("Server not found", 404, "SERVER_NOT_FOUND", { id: params.id });
                }

                // get client
                const client = await this.getClient(ctx, server);

                // get server commands
                const commands = await client.db("admin").command({ listCommands: 1 });

                return commands;
            }
        },

        /**
         * list server features
         * 
         * @actions
         * @param {String} id - mongodb server id
         * 
         * @returns {Object} server features
         */
        features: {
            rest: {
                method: "GET",
                path: "/:id/features",
            },
            permissions: ['mongodb.servers.features'],
            params: {
                id: {
                    type: "string",
                    optional: false,
                    description: "mongodb server id",
                }
            },
            async handler(ctx) {
                const params = Object.assign({}, ctx.params);

                // get server
                const server = await ctx.call("v1.mongodb.servers.resolve", params);

                //check if server exists
                if (!server) {
                    throw new MoleculerClientError("Server not found", 404, "SERVER_NOT_FOUND", { id: params.id });
                }

                // get client
                const client = await this.getClient(ctx, server);

                // get server features
                const features = await client.db("admin").command({ features: 1 });

                return features;
            }
        },

        /**
         * list server logs
         * 
         * @actions
         * @param {String} id - mongodb server id
         * @param {Object} filter - mongodb server logs filter
         * 
         * @returns {Object} server logs
         */
        logs: {
            rest: {
                method: "GET",
                path: "/:id/logs",
            },
            permissions: ['mongodb.servers.logs'],
            params: {
                id: {
                    type: "string",
                    optional: false,
                    description: "mongodb server id",
                },
                filter: {
                    type: "object",
                    optional: true,
                    description: "mongodb server logs filter",
                }
            },
            async handler(ctx) {
                const params = Object.assign({}, ctx.params);

                // get server
                const server = await this.resolveEntities(null, {
                    id: params.id,
                })

                //check if server exists
                if (!server) {
                    throw new MoleculerClientError("Server not found", 404, "SERVER_NOT_FOUND", params);
                }

                // get client
                const client = await this.getClient(ctx, server);

                // get server logs
                const logs = await client.db("admin").command({ getLog: "global" });

                return logs;
            }
        },

        /**
         * list server connections
         * 
         * @actions
         * @param {String} id - mongodb server id
         * 
         * @returns {Object} server connections
         */
        connections: {
            rest: {
                method: "GET",
                path: "/:id/connections",
            },
            permissions: ['mongodb.servers.connections'],
            params: {
                id: {
                    type: "string",
                    optional: false,
                    description: "mongodb server id",
                },
            },
            async handler(ctx) {
                const params = Object.assign({}, ctx.params);

                // get server
                const server = await this.resolveEntities(null, {
                    id: params.id,
                })

                //check if server exists
                if (!server) {
                    throw new MoleculerClientError("Server not found", 404, "SERVER_NOT_FOUND", params);
                }

                // get client
                const client = await this.getClient(ctx, server);

                // get server connections
                const connections = await client.db("admin").command({ currentOp: 1 });

                return connections;
            }
        },

        /**
         * drop server connection
         * 
         * @actions
         * @param {String} id - mongodb server id
         * @param {String} host - mongodb client host
         * @param {String} port - mongodb client port
         * 
         * @returns {Object} server connections
         */
        dropConnection: {
            rest: {
                method: "DELETE",
                path: "/:id/connections/:host/:port",
            },
            permissions: ['mongodb.servers.dropConnection'],
            params: {
                id: {
                    type: "string",
                    optional: false,
                    description: "mongodb server id",
                },
                host: {
                    type: "string",
                    optional: false,
                    description: "mongodb client host",
                },
                port: {
                    type: "number",
                    min: 1,
                    max: 65535,
                    optional: false,
                    description: "mongodb client port",
                },
            },
            async handler(ctx) {
                const params = Object.assign({}, ctx.params);

                // get server
                const server = await this.resolveEntities(null, {
                    id: params.id,
                })

                //check if server exists
                if (!server) {
                    throw new MoleculerClientError("Server not found", 404, "SERVER_NOT_FOUND", params);
                }

                // get client
                const client = await this.getClient(ctx, server);

                // get server connections
                const connections = await client.db("admin").command({
                    dropConnections: 1,
                    hostAndPort: [`${params.host}:${params.port}`]
                });

                return connections;
            }
        },

    },

    /**
     * Events
     */
    events: {

    },

    /**
     * Methods
     */
    methods: {

    },

    /**
     * Service created lifecycle event handler
     */
    created() { },

    /**
     * Service started lifecycle event handler
     */
    started() { },


    /**
     * Service stopped lifecycle event handler
     */
    stopped() { }
};
