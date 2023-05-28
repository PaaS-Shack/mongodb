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
    name: "mongodb.replicasets",
    version: 1,

    mixins: [
        DbService({})
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
        rest: "/v1/mongodb-replicasets/",

        fields: {

            name: {
                type: "string",
                required: true,
            },


            servers: {
                type: 'array',
                items: "string",
                required: false,
                default: [],
                populate: {
                    action: "v1.mongodb.servers.resolve",
                    params: {}
                }
            },

            users: {
                type: "array",
                items: { type: "string", empty: false },
                default: [],
                populate: {
                    action: "v1.mongodb.users.resolve",
                },
            },
            databases: {
                type: "array",
                items: { type: "string", empty: false },
                default: [],
                populate: {
                    action: "v1.mongodb.databases.resolve",
                },
            },
            

            options: { type: "object" },
            createdAt: {
                type: "number",
                readonly: true,
                onCreate: () => Date.now(),
            },
            updatedAt: {
                type: "number",
                readonly: true,
                onUpdate: () => Date.now(),
            },
            deletedAt: {
                type: "number",
                readonly: true,
                hidden: "byDefault",
                onRemove: () => Date.now(),
            },
        },

        defaultPopulates: [],

        scopes: {
            notDeleted: { deletedAt: null },
        },

        defaultScopes: ["notDeleted"]
    },


    /**
     * Actions
     */

    actions: {

        create: {
            permissions: ['mongodb.replicasets.create'],
        },
        list: {
            permissions: ['mongodb.replicasets.list'],
            params: {}
        },

        find: {
            rest: "GET /find",
            permissions: ['mongodb.replicasets.find'],
            params: {}
        },

        count: {
            rest: "GET /count",
            permissions: ['mongodb.replicasets.count'],
            params: {}
        },

        get: {
            needEntity: true,
            permissions: ['mongodb.replicasets.get'],
        },

        update: {
            rest: false,
            needEntity: true,
            permissions: ['mongodb.replicasets.update'],
        },

        replace: false,

        remove: {
            needEntity: true,
            permissions: ['mongodb.replicasets.remove'],

        },
        addMember: {
            params: {
                id: { type: "string", optional: false },
                member: { type: "string", optional: false },
                arbiterOnly: { type: "boolean", default: false, optional: false },
                buildIndexes: { type: "boolean", default: true, optional: false },
                hidden: { type: "boolean", default: false, optional: false },
                priority: { type: "number", default: 1, optional: false },
                votes: { type: "number", default: 1, optional: false },
            },
            async handler(ctx) {
                const params = Object.assign({}, ctx.params);
                const replicaset = await ctx.call('v1.mongodb.replicasets.resolve', {
                    id: params.id,
                    populate: ['servers']
                })
                const server = await ctx.call('v1.mongodb.servers.resolve', {
                    id: params.member
                })
                const primaryServer = await this.primaryServer(ctx, replicaset.servers);

                if (!primaryServer) {
                    throw new MoleculerClientError(`No primary server found`)
                }

                const { config } = await ctx.call('v1.mongodb.client.replSetGetConfig', {
                    id: primaryServer.id
                })


                for (let index = 0; index < config.members.length; index++) {
                    const member = config.members[index];
                    if (`${server.hostname}:${server.port}` == member.host) {
                        throw new MoleculerClientError(`Host already a member`)
                    }
                }

                config.version++

                config.members.push({
                    _id: config.members.length + 1,
                    host: `${server.hostname}:${server.port}`,
                    arbiterOnly: params.arbiterOnly,
                    buildIndexes: params.buildIndexes,
                    hidden: params.hidden,
                    priority: params.priority,
                    tags: {},
                    slaveDelay: 0,
                    votes: params.votes
                })
                console.log(config)

                await ctx.call('v1.mongodb.client.replSetReconfig', {
                    id: primaryServer.id,
                    config: config
                })

                await ctx.call('v1.mongodb.servers.update', {
                    id: server.id,
                    replicaset: replicaset.id
                })
                return this.updateEntity(
                    ctx,
                    {
                        id: params.id,
                        $addToSet: {
                            servers: params.member
                        }
                    },
                    { permissive: true, raw: true }
                );
            }
        },
        removeMember: {
            params: {
                id: { type: "string", optional: false },
                member: { type: "string", optional: false }
            },
            async handler(ctx) {
                const params = Object.assign({}, ctx.params);

                const replicaset = await ctx.call('v1.mongodb.replicasets.resolve', {
                    id: params.id,
                    populate: ['servers']
                })
                const server = await ctx.call('v1.mongodb.servers.resolve', {
                    id: params.member
                })

                const primaryServer = await this.primaryServer(ctx, replicaset.servers);

                if (!primaryServer) {
                    throw new MoleculerClientError(`No primary server found`)
                }

                const { config } = await ctx.call('v1.mongodb.client.replSetGetConfig', {
                    id: primaryServer.id
                })


                config.version++

                const members = [];

                for (let index = 0; index < config.members.length; index++) {
                    const memebr = config.members[index];
                    if (memebr.host == `${server.hostname}:${server.port}`) {
                        continue;
                    }
                    members.push({
                        ...memebr
                    })
                }
                config.members = members

                console.log(config)

                await ctx.call('v1.mongodb.client.replSetReconfig', {
                    id: primaryServer.id,
                    config: config
                })
                
                await ctx.call('v1.mongodb.servers.update', {
                    id: server.id,
                    replicaset: null
                })

                return this.updateEntity(
                    ctx,
                    {
                        id: params.id,
                        $pull: {
                            servers: params.member
                        }
                    },
                    { permissive: true, raw: true }
                );
            }
        },
    },

    /**
     * mongodb.replicasets
     */
    events: {

        async "mongodb.replicasets.created"(ctx) {
            const { id } = ctx.params.data;




        },
        async "mongodb.replicasets.updated"(ctx) {
            const { id } = ctx.params.data;


        },
        async "mongodb.replicasets.removed"(ctx) {
            const { id } = ctx.params.data;

        },
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
                console.log(servers)
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
    stopped() {

    }
};
