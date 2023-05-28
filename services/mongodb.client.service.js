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

/**
 * attachments of addons service
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
        rest: "/v1/mongodb-client/",

    },


    /**
     * Actions
     */

    actions: {

        createClient: {
            params: {
                id: { type: "string", optional: false },
                // uri: { type: "string", optional: false },
            },
            async handler(ctx) {
                const params = Object.assign({}, ctx.params);

                const server = await ctx.call('v1.mongodb.servers.resolve', {
                    id: params.id
                });

                let uri = `mongodb://${server.username}:${server.password}@${server.hostname}:${server.port}/admin`

                if (false && server.replicaSet && server.replicaSet != '') {
                    uri += `?replicaSet=${server.replicaSet}`
                } else {
                    uri += `?directConnection=true`
                }

                await this.createClient(server.name, uri);

                return true;
            }
        },
        listClients: {
            params: {

            },
            async handler(ctx) {
                const params = Object.assign({}, ctx.params);

                return Array.from(this.clients.keys())
            }
        },
        replSetInitiate: {
            params: {
                id: { type: "string", optional: false },
                member: { type: "string", optional: false },
            },
            async handler(ctx) {
                const params = Object.assign({}, ctx.params);
                const { name, replicaSet, hostname, port } = await ctx.call('v1.mongodb.servers.resolve', {
                    id: params.id,
                    fields: ['name', 'replicaSet', 'hostname', 'port']
                })
                const db = this.getClient(name).db('admin')
                return db.command({
                    replSetInitiate: {
                        _id: replicaSet,
                        members: [{
                            _id: 0,
                            host: `${hostname}:${port}`
                        }, {

                            _id: 1,
                            host: 'mongodb-0.mongodb.dev.svc.cloud.one-host.ca'
                        }, {
                            _id: 2,
                            host: 'mongodb-1.mongodb.dev.svc.cloud.one-host.ca'
                        }, {
                            _id: 3,
                            host: 'mongodb-2.mongodb.dev.svc.cloud.one-host.ca'
                        }]
                    }
                })
            }
        },
        replSetReconfig: {
            params: {
                id: { type: "string", optional: false },
                config: { type: "object", optional: false },
            },
            async handler(ctx) {
                const params = Object.assign({}, ctx.params);
                const { name, replicaSet, hostname, port } = await ctx.call('v1.mongodb.servers.resolve', {
                    id: params.id,
                    fields: ['name', 'replicaSet', 'hostname', 'port']
                })
                const db = this.getClient(name).db('admin')
                return db.command({
                    replSetReconfig: params.config
                })
            }
        },
        replSetGetConfig: {
            params: {
                id: { type: "string", optional: false },
            },
            async handler(ctx) {
                const params = Object.assign({}, ctx.params);
                const { name, replicaSet, hostname, port } = await ctx.call('v1.mongodb.servers.resolve', {
                    id: params.id,
                    fields: ['name', 'replicaSet', 'hostname', 'port']
                })
                const db = this.getClient(name).db('admin')
                return db.command({
                    replSetGetConfig: 1

                })
            }
        },
        replSetGetStatus: {
            params: {
                id: { type: "string", optional: false },
            },
            async handler(ctx) {
                const params = Object.assign({}, ctx.params);
                const { name, replicaSet, hostname, port } = await ctx.call('v1.mongodb.servers.resolve', {
                    id: params.id,
                    fields: ['name', 'replicaSet', 'hostname', 'port']
                })
                const db = this.getClient(name).db('admin')
                return db.command({
                    replSetGetConfig: 1
                })
            }
        },

        hello: {
            params: {
                id: { type: "string", optional: false },
            },
            async handler(ctx) {
                const params = Object.assign({}, ctx.params);
                const { name, replicaSet, hostname, port } = await ctx.call('v1.mongodb.servers.resolve', {
                    id: params.id,
                    fields: ['name', 'replicaSet', 'hostname', 'port']
                })
                const db = this.getClient(name).db('admin')
                return db.command({
                    hello: 1
                })
            }
        },
        listCollections: {
            params: {
                id: { type: "string", optional: false },
                db: { type: "string", optional: false },
            },
            async handler(ctx) {
                const params = Object.assign({}, ctx.params);

                const { name } = await ctx.call('v1.mongodb.servers.resolve', {
                    id: params.id,
                    fields: ['name']
                })

                const client = this.getClient(name)

                const db = client.db(params.db);

                return db.listCollections().toArray();
            }
        },
        listDatabases: {
            params: {
                id: { type: "string", optional: false },
            },
            async handler(ctx) {
                const params = Object.assign({}, ctx.params);
                const { name } = await ctx.call('v1.mongodb.servers.resolve', {
                    id: params.id,
                    fields: ['name']
                })

                const client = this.getClient(name)

                const db = client.db().admin()
                return db.listDatabases()
            }
        },
        currentOp: {
            params: {
                id: { type: "string", optional: false },
            },
            async handler(ctx) {
                const params = Object.assign({}, ctx.params);
                const { name } = await ctx.call('v1.mongodb.servers.resolve', {
                    id: params.id,
                    fields: ['name']
                })
                const db = this.getClient(name).db('admin')
                return db.command({
                    currentOp: 1
                })
            }
        },
        connPoolStats: {
            params: {
                id: { type: "string", optional: false },
            },
            async handler(ctx) {
                const params = Object.assign({}, ctx.params);
                const { name } = await ctx.call('v1.mongodb.servers.resolve', {
                    id: params.id,
                    fields: ['name']
                })
                const db = this.getClient(name).db('admin')
                return db.command({
                    connPoolStats: 1
                })
            }
        },
        buildInfo: {
            params: {
                id: { type: "string", optional: false },
            },
            async handler(ctx) {
                const params = Object.assign({}, ctx.params);
                const { name } = await ctx.call('v1.mongodb.servers.resolve', {
                    id: params.id,
                    fields: ['name']
                })
                const db = this.getClient(name).db('admin')
                return db.command({
                    buildInfo: 1
                })
            }
        },
        connectionStatus: {
            params: {
                id: { type: "string", optional: false },
                showPrivileges: { type: "boolean", optional: true, default: false },
            },
            async handler(ctx) {
                const params = Object.assign({}, ctx.params);
                const { name } = await ctx.call('v1.mongodb.servers.resolve', {
                    id: params.id,
                    fields: ['name']
                })
                const db = this.getClient(name).db('admin')
                return db.command({
                    connectionStatus: 1,
                    showPrivileges: params.showPrivileges
                })
            }
        },
        dataSize: {
            params: {
                id: { type: "string", optional: false },
                collection: { type: "string", optional: false },
                estimate: { type: "boolean", optional: true, default: false },
            },
            async handler(ctx) {
                const params = Object.assign({}, ctx.params);
                const { name } = await ctx.call('v1.mongodb.servers.resolve', {
                    id: params.id,
                    fields: ['name']
                })
                const db = this.getClient(name).db('admin')
                return db.command({
                    dataSize: params.collection,
                    estimate: params.estimate
                })
            }
        },
        dbStats: {
            params: {
                id: { type: "string", optional: false },
                db: { type: "string", optional: false },
            },
            async handler(ctx) {
                const params = Object.assign({}, ctx.params);
                const { name } = await ctx.call('v1.mongodb.servers.resolve', {
                    id: params.id,
                    fields: ['name']
                })
                const db = this.getClient(name).db(params.db)
                return db.command({
                    dbStats: 1
                })
            }
        },
        hostInfo: {
            params: {
                id: { type: "string", optional: false },
            },
            async handler(ctx) {
                const params = Object.assign({}, ctx.params);
                const { name } = await ctx.call('v1.mongodb.servers.resolve', {
                    id: params.id,
                    fields: ['name']
                })
                const db = this.getClient(name).db('admin')
                return db.command({
                    hostInfo: 1
                })
            }
        },
        serverStatus: {
            params: {
                id: { type: "string", optional: false },
            },
            async handler(ctx) {
                const params = Object.assign({}, ctx.params);
                const { name } = await ctx.call('v1.mongodb.servers.resolve', {
                    id: params.id,
                    fields: ['name']
                })
                console.log(name)
                const db = this.getClient(name).db('admin')
                return db.command({
                    serverStatus: 1
                })
            }
        },
        shardConnPoolStats: {
            params: {
                id: { type: "string", optional: false },
            },
            async handler(ctx) {
                const params = Object.assign({}, ctx.params);
                const { name } = await ctx.call('v1.mongodb.servers.resolve', {
                    id: params.id,
                    fields: ['name']
                })
                const db = this.getClient(name).db('admin')
                return db.command({
                    shardConnPoolStats: 1
                })
            }
        },
        top: {
            params: {
                id: { type: "string", optional: false },
            },
            async handler(ctx) {
                const params = Object.assign({}, ctx.params);
                const { name } = await ctx.call('v1.mongodb.servers.resolve', {
                    id: params.id,
                    fields: ['name']
                })
                const db = this.getClient(name).db('admin')
                return db.command({
                    top: 1
                })
            }
        },
        usersInfo: {
            params: {
                id: { type: "string", optional: false },
                user: { type: "string", optional: false },
            },
            async handler(ctx) {
                const params = Object.assign({}, ctx.params);
                const { name } = await ctx.call('v1.mongodb.servers.resolve', {
                    id: params.id,
                    fields: ['name']
                })
                const db = this.getClient(name).db('admin')
                return db.command({
                    top: 1
                })
            }
        },
        createUser: {
            params: {
                id: { type: "string", optional: false },
                username: { type: "string", optional: false },
                password: { type: "string", optional: false },
                database: { type: "string", optional: false },
            },
            async handler(ctx) {
                const params = Object.assign({}, ctx.params);
                const { name } = await ctx.call('v1.mongodb.servers.resolve', {
                    id: params.id,
                    fields: ['name']
                })
                const db = this.getClient(name).db('admin')
                return db.command({
                    createUser: username,
                    pwd: password,
                    roles: [{
                        role: 'dbOwner',
                        db: database
                    }]
                })
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
        getClient(name) {
            return this.clients.get(name)
        },
        async createClient(name, uri) {

            console.log('createClient', name, uri)
            const found = this.getClient(name)

            if (found) {
                console.log(found)
                return found
            }

            const client = await MongoClient.connect(uri);
            this.clients.set(name, client)


            return client
        }
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
        return this.broker.call('v1.mongodb.servers.find').then((res) => {
            res.forEach(server => {
                this.actions.createClient({
                    id: server.id
                })
            });
        })
    },


    /**
     * Service stopped lifecycle event handler
     */
    async stopped() {
        for (const [name, client] of this.clients) {
            await client.close();
        }
    }
};
