"use strict";



const DbService = require("db-mixin");
const Membership = require("membership-mixin");
const ConfigLoader = require("config-mixin");

const { MoleculerClientError } = require("moleculer").Errors;


const MongoMixin = require("../mixins/mongodb.mixin");

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
        ConfigLoader(['mongodb.**']),
        MongoMixin,
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

        /**
         * convert to capped collection
         * 
         * @actions
         * @param {String} id - mongodb database id
         * @param {String} coll - mongodb collection name
         * @param {Number} size - capped collection size
         * @param {Number} max - capped collection max
         * 
         * @returns {Object} collection stats
         */
        convertToCapped: {
            rest: {
                method: "POST",
                path: "/:id/convertToCapped",
            },
            permissions: ['mongodb.servers.stats'],
            params: {
                id: {
                    type: "string",
                    optional: false,
                    description: "mongodb database id",
                },
                coll: {
                    type: "string",
                    optional: false,
                    description: "mongodb collection name",
                },
                size: {
                    type: "number",
                    optional: true,
                    description: "capped collection size",
                },
                max: {
                    type: "number",
                    optional: true,
                    description: "capped collection max",
                },
            },
            async handler(ctx) {
                const params = Object.assign({}, ctx.params);
                // get database
                const database = await this.resolveEntities(null, {
                    id: params.id,
                    populate: ["server"],
                })

                // get client
                const client = await this.getClient(ctx, database.server);

                // convert to capped collection
                const stats = await client.db(database.name).command({
                    convertToCapped: params.coll,
                    size: params.size,
                    max: params.max
                });

                return stats;
            }
        },

        /**
         * get collection stats
         * 
         * @actions
         * @param {String} id - mongodb database id
         * @param {String} coll - mongodb collection name
         * 
         * @returns {Object} collection stats
         */
        collStats: {
            rest: {
                method: "GET",
                path: "/:id/collStats",
            },
            permissions: ['mongodb.servers.stats'],
            params: {
                id: {
                    type: "string",
                    optional: false,
                    description: "mongodb database id",
                },
                coll: {
                    type: "string",
                    optional: false,
                    description: "mongodb collection name",
                },
            },
            async handler(ctx) {
                const params = Object.assign({}, ctx.params);
                // get database
                const database = await this.resolveEntities(null, {
                    id: params.id,
                    populate: ["server"],
                })

                // get client
                const client = await this.getClient(ctx, database.server);

                // get collection stats
                const stats = await client.db(database.name).command({
                    collStats: params.coll,
                });

                return stats;
            }
        },

        /**
         * get collection indexes
         * 
         * @actions
         * @param {String} id - mongodb database id
         * @param {String} coll - mongodb collection name
         * 
         * @returns {Object} collection indexes
         */
        indexes: {
            rest: {
                method: "GET",
                path: "/:id/indexes",
            },
            permissions: ['mongodb.servers.stats'],
            params: {
                id: {
                    type: "string",
                    optional: false,
                    description: "mongodb database id",
                },
                coll: {
                    type: "string",
                    optional: false,
                    description: "mongodb collection name",
                },
            },
            async handler(ctx) {
                const params = Object.assign({}, ctx.params);
                // get database
                const database = await this.resolveEntities(null, {
                    id: params.id,
                    populate: ["server"],
                })

                // get client
                const client = await this.getClient(ctx, database.server);

                // get collection indexes
                const indexes = await client.db(database.name).collection(params.coll).indexes();

                return indexes;
            }
        },

        /**
         * create collection index
         * 
         * @actions
         * @param {String} id - mongodb database id
         * @param {String} coll - mongodb collection name
         * @param {Object} index - mongodb index definition
         * 
         * @returns {Object} collection indexes
         */
        createIndex: {
            rest: {
                method: "POST",
                path: "/:id/indexes",
            },
            permissions: ['mongodb.servers.stats'],
            params: {
                id: {
                    type: "string",
                    optional: false,
                    description: "mongodb database id",
                },
                coll: {
                    type: "string",
                    optional: false,
                    description: "mongodb collection name",
                },
                index: {
                    type: "object",
                    props: {
                        key: {
                            type: "array",
                            items: {
                                type: "object",
                                props: {
                                    field: {
                                        type: "string",
                                    },
                                    order: {
                                        type: "number",
                                        optional: true,
                                        default: 1,
                                    },
                                },
                            },

                        },
                        name: {
                            type: "string",
                        },
                        background: {
                            type: "boolean",
                            optional: true,
                            default: false,
                        },
                    },
                },
            },
            async handler(ctx) {
                const params = Object.assign({}, ctx.params);
                // get database
                const database = await this.resolveEntities(null, {
                    id: params.id,
                    populate: ["server"],
                })

                // get client
                const client = await this.getClient(ctx, database.server);

                // create collection index
                const index = await client.db(database.name).collection(params.coll).createIndex(params.index);

                return index;
            }
        },

        /**
         * drop collection index
         * 
         * @actions
         * @param {String} id - mongodb database id
         * @param {String} coll - mongodb collection name
         * @param {String} name - mongodb index name
         * 
         * @returns {Object} collection indexes
         */
        dropIndex: {
            rest: {
                method: "DELETE",
                path: "/:id/indexes",
            },
            permissions: ['mongodb.servers.stats'],
            params: {
                id: {
                    type: "string",
                    optional: false,
                    description: "mongodb database id",
                },
                coll: {
                    type: "string",
                    optional: false,
                    description: "mongodb collection name",
                },
                name: {
                    type: "string",
                    optional: false,
                    description: "mongodb index name",
                },
            },
            async handler(ctx) {
                const params = Object.assign({}, ctx.params);
                // get database
                const database = await this.resolveEntities(null, {
                    id: params.id,
                    populate: ["server"],
                })

                // get client
                const client = await this.getClient(ctx, database.server);

                // drop collection index
                const index = await client.db(database.name).collection(params.coll).dropIndex(params.name);

                return index;
            }
        },

        /**
         * drop database
         * 
         * @actions
         * @param {String} id - mongodb database id
         * 
         * @returns {Object} database object
         */
        drop: {
            rest: {
                method: "DELETE",
                path: "/:id/drop",
            },
            permissions: ['mongodb.servers.drop'],
            params: {
                id: {
                    type: "string",
                    optional: false,
                    description: "mongodb database id",
                },
            },
            async handler(ctx) {
                const params = Object.assign({}, ctx.params);
                // get database
                const database = await this.resolveEntities(null, {
                    id: params.id,
                    populate: ["server"],
                })

                // get client
                const client = await this.getClient(ctx, database.server);

                // drop database
                const result = await client.db(database.name).dropDatabase()
                    .catch((error) => {
                        this.logger.error(error);
                    });;

                return this.removeEntity(ctx, {
                    id: params.id,
                });
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
