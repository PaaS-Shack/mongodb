"use strict";



const DbService = require("db-mixin");
const Membership = require("membership-mixin");
const ConfigLoader = require("config-mixin");

const { MoleculerClientError } = require("moleculer").Errors;



/**
 * this service maanges mongodb databases
 */
module.exports = {
    name: "mongodb.databases",
    version: 1,

    mixins: [
        DbService({
            permissions: "mongodb.databases",
        }),
        ConfigLoader(['mongodb.**'])
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

            // mongodb database name
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
                description: "mongodb database name"
            },

            // mongodb database server
            server: {
                type: "string",
                required: true,
                description: "mongodb database server",
                populate: {
                    action: "v1.mongodb.servers.resolve",
                }
            },


            ...DbService.FIELDS,// inject dbservice fields
        },
        defaultPopulates: [],

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
         * get collection stats
         * 
         * @actions
         * @param {String} id - mongodb server id
         * @param {String} collStats - mongodb collection name
         * @param {Number} scale - scale factor
         * 
         * @returns {Object} collection stats
         */
        stats: {
            rest: {
                method: "GET",
                path: "/:id/stats",
            },
            permissions: ['mongodb.servers.stats'],
            params: {
                id: {
                    type: "string",
                    optional: false,
                    description: "mongodb server id",
                },
                collStats: {
                    type: "string",
                    optional: true,
                    description: "mongodb collection name",
                },
                scale: {
                    type: "number",
                    optional: true,
                    description: "scale factor",
                },
            },
            async handler(ctx) {
                const params = Object.assign({}, ctx.params);
                // get server
                const server = await this.resolve(ctx, params.id);

                // get client
                const client = await this.getClient(ctx, server);

                // get collection stats
                const stats = await client.db("admin").command({
                    collStats: params.collStats,
                    scale: params.scale
                });

                return stats;
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
