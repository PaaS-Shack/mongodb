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
    name: "mongodb.provisions",
    version: 1,

    mixins: [
        DbService({}),
		Membership({
			permissions: 'mongodb.provisions'
		})
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
        rest: "/v1/mongodb-provisions/",

        fields: {


            database: {
                type: "string",
                required: true,
                empty: false,
                populate: {
                    action: "v1.mongodb.databases.resolve",
                    params: {}
                }
            },
            replicaset: {
                type: "string",
                required: true,
                empty: false,
                populate: {
                    action: "v1.mongodb.replicasets.resolve",
                    params: {}
                }
            },
            user: {
                type: "string",
                required: true,
                populate: {
                    action: "v1.mongodb.users.resolve",
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
            permissions: ['mongodb.databases.create'],
        },
        list: {
            permissions: ['mongodb.databases.list'],
            params: {}
        },

        find: {
            rest: "GET /find",
            permissions: ['mongodb.databases.find'],
            params: {}
        },

        count: {
            rest: "GET /count",
            permissions: ['mongodb.databases.count'],
            params: {}
        },

        get: {
            needEntity: true,
            permissions: ['mongodb.databases.get'],
        },

        update: {
            rest: false,
            needEntity: true,
            permissions: ['mongodb.databases.update'],
        },

        replace: false,

        remove: {
            needEntity: true,
            permissions: ['mongodb.databases.remove'],

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
     * mongodb.databases
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
