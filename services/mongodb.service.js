"use strict";

const DbService = require("db-mixin");
const Membership = require("membership-mixin");
const generator = require('generate-password');
const Cron = require('cron-mixin');

const { MoleculerClientError } = require("moleculer").Errors;


/**
 * attachments of addons service
 */
module.exports = {
    name: "mongodb",
    version: 1,

    mixins: [

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
        rest: "/v1/mongodb/",

    },


    /**
     * Actions
     */

    actions: {

        init: {
            params: {

            },
            async handler(ctx) {
                const params = Object.assign({}, ctx.params);


                const userData = {
                    username: 'admin',
                    password: 'password',
                    roles: ['root']
                }

                const servers = [{
                    name: 'mongodb-0',
                    hostname: 'mongodb-0.mongodb.dev.svc.cloud.one-host.ca',
                    port: '27017'
                }, {
                    name: 'mongodb-1',
                    hostname: 'mongodb-1.mongodb.dev.svc.cloud.one-host.ca',
                    port: '27017'
                }, {
                    name: 'mongodb-2',
                    hostname: 'mongodb-2.mongodb.dev.svc.cloud.one-host.ca',
                    port: '27017'
                }, {
                    name: 'mongodb-3',
                    hostname: 'mongodb-3.mongodb.dev.svc.cloud.one-host.ca',
                    port: '27017'
                }]
                let user = await ctx.call('v1.mongodb.users.create', userData)

                let initServer = await ctx.call('v1.mongodb.servers.create', {
                    name: 'mongodb-init-64d978757b-42l6k',
                    users: [user.id],
                    hostname: '10.60.50.113',
                    port: '27017',
                })
                let replicaset = await ctx.call('v1.mongodb.replicasets.create', {
                    name: 'rs1',
                    users: [user.id],
                    servers: [initServer.id]
                })
                await ctx.call('v1.mongodb.servers.update', {
                    id: initServer.id,
                    replicaset: replicaset.id
                })


                await ctx.call('v1.mongodb.client.createClient', {
                    id: initServer.id
                })

                await ctx.call('v1.mongodb.client.replSetInitiate', {
                    id: replicaset.id
                })

                for (let index = 0; index < servers.length; index++) {
                    const spec = servers[index];
                    await ctx.call('v1.mongodb.servers.create', {
                        ...spec,
                        users: [user.id]
                    })

                }
            }
        },

        pack: {
            params: {
                id: { type: "string", min: 3, optional: false },
            },
            permissions: ['teams.create'],
            async handler(ctx) {
                const params = Object.assign({}, ctx.params);


                const provision = await ctx.call('v1.mongodb.provisions.resolve', {
                    id: params.id
                })
                const user = await ctx.call('v1.mongodb.users.resolve', {
                    id: provision.user
                })
                const database = await ctx.call('v1.mongodb.databases.resolve', {
                    id: provision.database
                })
                const replicaset = await ctx.call('v1.mongodb.replicasets.resolve', {
                    id: provision.replicaset,
                    populate: ['servers']
                })


                return {
                    MONGO_USERNAME: user.username,
                    MONGO_PASSWORD: user.password,
                    MONGO_DATABASE: database.name,
                    MONGO_HOST: replicaset.srv,
                    MONGO_PORT: replicaset.port,
                    MONGO_REPLICASET: replicaset.name,
                    MONGO_URI: `mongodb://${user.username}:${user.password}@${replicaset.srv}:${replicaset.port}/${database.name}?replicaSet=${replicaset.name}`
                };
            }
        },
        provision: {
            params: {
                id: { type: "string", optional: true },
                zone: { type: "string", optional: true },
                prefix: { type: "string", default: 'provision', optional: true },
            },
            permissions: ['teams.create'],
            async handler(ctx) {
                const params = Object.assign({}, ctx.params);

                const database = `${params.prefix}_${generator.generate({
                    length: 4,
                    numbers: true
                })}`;
                let username = `${params.prefix}_${generator.generate({
                    length: 4,
                    numbers: true
                })}`;
                let password = generator.generate({
                    length: 20,
                    numbers: true
                })
                const role = 'dbOwner';

                let replicaset = await ctx.call('v1.mongodb.replicasets.find', {
                    query: {
                        zone: params.zone
                    },
                    populate: ['servers']
                }).then((res) => res.shift())

                if (!replicaset) {
                    replicaset = await ctx.call('v1.mongodb.replicasets.find', { populate: ['servers'] }).then((res) => res.shift())
                }
                if (!replicaset) {
                    throw new Error('NO MONGODB replicaset')
                }

                const primary = await this.primaryServer(ctx, replicaset.servers)

                await ctx.call('v1.mongodb.client.createUser', {
                    id: primary.id,
                    username,
                    password,
                    role,
                    database
                })


                let databaseEntry = await ctx.call('v1.mongodb.databases.create', {
                    name: database,
                    replicaset: replicaset.id
                })
                const userEntry = await ctx.call('v1.mongodb.users.create', {
                    username,
                    password,
                    roles: [role],
                    database: databaseEntry.id,
                    replicaset: replicaset.id,
                })

                databaseEntry.users.push(userEntry.id)
                databaseEntry = await ctx.call('v1.mongodb.databases.update', {
                    id: databaseEntry.id,
                    users: databaseEntry.users
                })

                replicaset.users.push(userEntry.id)
                replicaset = await ctx.call('v1.mongodb.replicasets.update', {
                    id: replicaset.id,
                    users: replicaset.users
                })

                const provision = await ctx.call('v1.mongodb.provisions.create', {
                    user: userEntry.id,
                    database: databaseEntry.id,
                    replicaset: replicaset.id
                })

                return provision
            }
        },
        deprovision: {
            params: {
                id: { type: "string", optional: false }
            },
            permissions: ['teams.create'],
            async handler(ctx) {
                const params = Object.assign({}, ctx.params);
                const provision = await ctx.call('v1.mongodb.provisions.resolve', {
                    id: params.id
                })

                let database = await ctx.call('v1.mongodb.databases.resolve', {
                    id: provision.database
                })
                let user = await ctx.call('v1.mongodb.users.resolve', {
                    id: provision.user
                })
                let replicaset = await ctx.call('v1.mongodb.replicasets.resolve', {
                    id: provision.replicaset,
                    populate: ['servers']
                })

                const primary = await this.primaryServer(ctx, replicaset.servers)

                await ctx.call('v1.mongodb.client.dropAllUsersFromDatabase', {
                    id: primary.id,
                    database: database.name
                })
                await ctx.call('v1.mongodb.client.dropDatabase', {
                    id: primary.id,
                    database: database.name
                })
                await ctx.call('v1.mongodb.databases.remove', {
                    id: database.id
                })
                await ctx.call('v1.mongodb.users.remove', {
                    id: user.id
                })
                await ctx.call('v1.mongodb.replicasets.update', {
                    id: replicaset.id,
                    users: replicaset.users.filter((id) => user.id !== id)
                })

                return ctx.call('v1.mongodb.provisions.remove', {
                    id: params.id
                })

                return provision
            }
        },
        createUser: {
            params: {
                id: { type: "string", optional: true },
                zone: { type: "string", optional: true },
                prefix: { type: "string", default: 'provision', optional: true },
            },
            async handler(ctx) {
                const params = Object.assign({}, ctx.params);
                const replicaset = await this.resolveEntities(ctx, {
                    id: user.replicaset
                })
            }
        },
        createDB: {
            params: {
                id: { type: "string", optional: false }
            },
            async handler(ctx) {
                const params = Object.assign({}, ctx.params);

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
        async primaryServer(ctx, servers) {
            for (let index = 0; index < servers.length; index++) {
                const server = servers[index];
                const hello = await ctx.call('v1.mongodb.client.hello', {
                    id: server.id
                }).catch(() => { return {} })
                if (hello.primary == hello.me) {
                    return server
                }
            }
        }
    },
    /**
     * Service created lifecycle event handler
     */
    created() {

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

    }
};
