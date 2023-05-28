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
    name: "mongodb.users",
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
        rest: "/v1/mongodb-users/",

        fields: {

            database: {
                type: "string",
                required: true,
                empty: false,

                populate: {
                    action: "v1.mongodb.databases.resolve",
                    params: {
                        //fields: ["id", "username", "fullName", "avatar"]
                    }
                },
            },

            username: {
                type: "string",
                required: true
            },
            password: {
                type: "string",
                required: true
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
            permissions: ['mongodb.users.create'],
        },
        list: {
            permissions: ['mongodb.users.list'],
            params: {}
        },

        find: {
            rest: "GET /find",
            permissions: ['mongodb.users.find'],
            params: {}
        },

        count: {
            rest: "GET /count",
            permissions: ['mongodb.users.count'],
            params: {}
        },

        get: {
            needEntity: true,
            permissions: ['mongodb.users.get'],
        },

        update: {
            rest: false,
            needEntity: true,
            permissions: ['mongodb.users.update'],
        },

        replace: false,

        remove: {
            needEntity: true,
            permissions: ['mongodb.users.remove'],

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
     * mongodb.users
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
