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
    name: "mongodb.servers",
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
        rest: "/v1/mongodb-servers/",

        fields: {

            name: {
                type: "string",
                required: true,
            },

            hostname: {
                type: "string",
                required: false
            },
            port: {
                type: "number",
                required: false
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
            replicaset: {
                type: "string",
                required: false,
                empty: false,
                populate: {
                    action: "v1.mongodb.replicasets.resolve",
                    params: {}
                }
            },
            zone: {
                type: "string",
                required: false
            },
            replicaSet: {
                type: "string",
                required: false
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
            permissions: ['mongodb.servers.create'],
        },
        list: {
            permissions: ['mongodb.servers.list'],
            params: {}
        },

        find: {
            rest: "GET /find",
            permissions: ['mongodb.servers.find'],
            params: {}
        },

        count: {
            rest: "GET /count",
            permissions: ['mongodb.servers.count'],
            params: {}
        },

        get: {
            needEntity: true,
            permissions: ['mongodb.servers.get'],
        },

        update: {
            rest: false,
            needEntity: true,
            permissions: ['mongodb.servers.update'],
        },

        replace: false,

        remove: {
            needEntity: true,
            permissions: ['mongodb.servers.remove'],

        },
        tally: {
            params: {

            },
            async handler(ctx) {
                const params = Object.assign({}, ctx.params);


            }
        },
    },

    /**
     * mongodb.servers
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
    stopped() {

    }
};
