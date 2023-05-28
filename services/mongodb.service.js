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
