"use strict";

const DbService = require("db-mixin");
const Membership = require("membership-mixin");
const generator = require('generate-password');
const Cron = require('cron-mixin');

const { MoleculerClientError } = require("moleculer").Errors;
const { MongoClient } = require('mongodb')

const ClientEvents = [
    "error", "timeout", "close", "open", "serverOpening", "serverClosed",
    "serverDescriptionChanged", "topologyOpening", "topologyClosed",
    "topologyDescriptionChanged", "connectionPoolCreated", "connectionPoolClosed",
    "connectionPoolCleared", "connectionPoolReady", "connectionCreated",
    "connectionReady", "connectionClosed", "connectionCheckOutStarted",
    "connectionCheckOutFailed", "connectionCheckedOut", "connectionCheckedIn",
    "commandStarted", "commandSucceeded", "commandFailed", "serverHeartbeatStarted",
    "serverHeartbeatSucceeded", "serverHeartbeatFailed"
]
/* 
    createUser
    Creates a new user.
    dropAllUsersFromDatabase
    Deletes all users associated with a database.
    dropUser
    Removes a single user.
    grantRolesToUser
    Grants a role and its privileges to a user.
    revokeRolesFromUser
    Removes a role from a user.
    updateUser
    Updates a user's data.
    usersInfo
    Returns information about the specified users. 
*/

/**
 * this services manages a pool of mongodb clients
 * 
 */
module.exports = {
    name: "mongodb.client",
    version: 1,

    mixins: [

    ],

    /**
     * Service dependencies
     */
    dependencies: [
        'v1.mongodb.servers'
    ],
    /**
     * Service settings
     */
    settings: {
        rest: "/v1/mongodb/:server/client/",

    },


    /**
     * Actions
     */

    actions: {
        /**
         * create mongodb client
         * 
         * @actions
         * @param {String} id - mongodb server id
         * 
         * @returns {Object} mongodb client
         */
        create: {
            rest: {
                method: "POST",
                path: "/create"
            },
            permissions: ['mongodb.client.create'],
            params: {
                server: { type: "string" },
            },
            async handler(ctx) {

                // get server
                const server = await ctx.call('v1.mongodb.servers.get', {
                    id: ctx.params.server,
                    populate: 'root'
                });
                console.log(server)
                // create client
                const client = await this.createClient(ctx, server);

                return client;
            }
        },
        /**
         * close all mongodb clients
         * 
         * @actions
         * 
         * @returns {Object} mongodb client
         */
        closeAll: {
            rest: {
                method: "POST",
                path: "/close/all"
            },
            permissions: ['mongodb.client.close.all'],
            async handler(ctx) {

                // close all clients
                const clients = await this.closeClients(ctx);

                return clients;
            }
        },

        /**
         * list server databases
         * 
         * @actions
         * @param {String} id - mongodb server id
         * 
         * @returns {Array} list of databases
         */
        listDatabases: {
            rest: {
                method: "GET",
                path: "/list/databases"
            },
            permissions: ['mongodb.client.list.databases'],
            params: {
                server: { type: "string" },
            },
            async handler(ctx) {

                // get server
                const server = await ctx.call('v1.mongodb.servers.get', {
                    id: ctx.params.server,
                    populate: 'root'
                });

                // get client
                const client = await this.getClient(ctx, server);

                // get databases
                const databases = await client.db().admin().listDatabases();

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
         * @returns {Array} list of collections
         */
        listCollections: {
            rest: {
                method: "GET",
                path: "/list/databases/:database/collections"
            },
            permissions: ['mongodb.client.list.collections'],
            params: {
                server: { type: "string" },
                database: { type: "string" },
            },
            async handler(ctx) {

                // get server
                const server = await ctx.call('v1.mongodb.servers.get', {
                    id: ctx.params.server,
                    populate: 'root'
                });

                // get client
                const client = await this.getClient(ctx, server);

                // get collections
                const collections = await client.db(ctx.params.database).listCollections().toArray();

                return collections;
            }
        },

        /**
         * list server current operations
         * 
         * @actions
         * @param {String} id - mongodb server id
         * 
         * @returns {Array} list of current operations
         */
        listCurrentOperations: {
            rest: {
                method: "GET",
                path: "/list/current/operations"
            },
            permissions: ['mongodb.client.list.current.operations'],
            params: {
                server: { type: "string" },
            },
            async handler(ctx) {

                // get server
                const server = await ctx.call('v1.mongodb.servers.get', {
                    id: ctx.params.server,
                    populate: 'root'
                });

                // get client
                const client = await this.getClient(ctx, server);

                // get current operations
                const currentOperations = await client.db('admin').command({
                    currentOp: 1
                })

                return currentOperations;
            }
        },

        /**
         * get server connection pool stats
         * 
         * @actions
         * @param {String} id - mongodb server id
         * 
         * @returns {Object} connection pool stats
         */
        getConnectionPoolStats: {
            rest: {
                method: "GET",
                path: "/get/connection/pool/stats"
            },
            permissions: ['mongodb.client.get.connection.pool.stats'],
            params: {
                server: { type: "string" },
            },
            async handler(ctx) {

                // get server
                const server = await ctx.call('v1.mongodb.servers.get', {
                    id: ctx.params.server,
                    populate: 'root'
                });

                // get client
                const client = await this.getClient(ctx, server);

                // get connection pool stats
                const connectionPoolStats = await client.db('admin').command({
                    serverStatus: 1
                })

                return connectionPoolStats;
            }
        },
        
        /**
         * create user on server
         * 
         * @actions
         * @param {String} id - mongodb server id
         * @param {String} username - mongodb user name
         * @param {String} password - mongodb user password
         * @param {String} database - mongodb database name
         * @param {String} roles - mongodb user roles
         * 
         * @returns {Object} mongodb user
         */
        createUser: {
            rest: {
                method: "POST",
                path: "/create/user"
            },
            permissions: ['mongodb.client.create.user'],
            params: {
                server: { type: "string" },
                username: { type: "string" },
                password: { type: "string" },
                database: { type: "string" },
                roles: { type: "array", items: "string" },
            },
            async handler(ctx) {

                // get server
                const server = await ctx.call('v1.mongodb.servers.get', {
                    id: ctx.params.server,
                    populate: 'root'
                });

                // get client
                const client = await this.getClient(ctx, server);

                // create user
                const user = await client.db(ctx.params.database).command({
                    createUser: ctx.params.username,
                    pwd: ctx.params.password,
                    roles: ctx.params.roles
                })

                return user;
            }
        },


    },
    /**
     * mongodb
     */
    events: {

    },
    /**
     * Methods
     */
    methods: {


        /**
         * create mongodb client
         * 
         * @param {Object} ctx - context of the request
         * @param {Object} server - mongodb server
         * 
         * @returns {Object} mongodb client
         */
        async createClient(ctx, server) {

            // check if client already exists
            if (this.clients.has(server.id)) {
                return this.clients.get(server.id);
            }

            const uri = await this.createUri(ctx, server);
            console.log(uri)
            // create client
            const client = await MongoClient.connect(uri);

            // store client
            this.clients.set(server.id, client);

            // add event handlers
            ClientEvents.forEach(event => {
                client.on(event, (...args) => {
                    this.logger.debug(`mongodb.client.${event}`, ...args)
                });
            });

            // connect
            // await client.connect();

            return client;
        },

        /**
         * create uri
         * 
         * @param {Object} ctx - context of the request
         * @param {Object} server - mongodb server
         */
        async createUri(ctx, server) {
            let authPart = '';

            const rootUser = server.root.roles.includes('root')

            if (rootUser) {
                authPart = `${server.root.name}:${server.root.password}@`
            }

            let dbPart = '';
            if (server.database) {
                dbPart = `${server.database.name}`
            }

            let uri = `mongodb://${authPart}${server.host}:${server.port}/${dbPart}?serverSelectionTimeoutMS=150000`

            uri += `&directConnection=true`

            return uri;
        },


        /**
         * get mongodb client
         * 
         * @param {Object} ctx - context of the request
         * @param {Object} server - mongodb server
         * 
         * @returns {Object} mongodb client
         */
        async getClient(ctx, server) {

            // check if client already exists
            if (this.clients.has(server.id)) {
                return this.clients.get(server.id);
            }

            // create client
            const client = await this.createClient(ctx, server);

            return client;
        },

        /**
         * close mongodb client
         * 
         * @param {Object} ctx - context of the request
         * @param {Object} server - mongodb server
         * 
         * @returns {Object} mongodb client
         */
        async closeClient(ctx, server) {

            // check if client already exists
            if (this.clients.has(server.id)) {
                const client = this.clients.get(server.id);
                await client.close();
                this.clients.delete(server.id);
                return client;
            }

            return null;
        },

        /**
         * close all mongodb clients 
         * 
         * @param {Object} ctx - context of the request
         * 
         * @returns {Object} mongodb client
         */
        async closeClients(ctx) {

            // close all clients
            for (const [id, client] of this.clients) {
                console.log(id)
                await client.close();
                this.clients.delete(id);
            }

            return this.clients;
        },

        /**
         * get mongodb database
         * 
         * @param {Object} ctx - context of the request
         * @param {Object} server - mongodb server
         * @param {Object} database - database object
         * 
         * @returns {Object} mongodb database
         */
        async getDatabase(ctx, server, database) {

            // get client
            const client = await this.getClient(ctx, server);

            // get database
            const db = client.db(database.name);

            return db;
        },

        /**
         * get mongodb collection
         * 
         * @param {Object} ctx - context of the request
         * @param {Object} server - mongodb server
         * @param {Object} database - database object
         * @param {Object} collection - collection object
         * 
         * @returns {Object} mongodb collection
         */
        async getCollection(ctx, server, database, collection) {

            // get database
            const db = await this.getDatabase(ctx, server, database);

            // get collection
            const col = db.collection(collection.name);

            return col;
        },



    },
    /**
     * Service created lifecycle event handler
     */
    created() {
        this.clients = new Map()
    },

    /**
     * Service started lifecycle event handler
     */
    async started() {


    },


    /**
     * Service stopped lifecycle event handler
     */
    async stopped() {
        await this.closeClients(this.broker);
    }
};
