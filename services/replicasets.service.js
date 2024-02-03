const DbService = require("db-mixin");
const Membership = require("membership-mixin");
const ConfigLoader = require("config-mixin");
const { MoleculerClientError } = require("moleculer").Errors;

/**
 * 
 */

module.exports = {
    // name of service
    name: "mongodb.replicasets",
    // version of service
    version: 1,

    /**
     * Service Mixins
     * 
     * @type {Array}
     * @property {DbService} DbService - Database mixin
     * @property {ConfigLoader} ConfigLoader - Config loader mixin
     */
    mixins: [
        DbService({}),
        ConfigLoader([
            'mongodb.**'
        ]),
    ],

    /**
     * Service dependencies
     */
    dependencies: [],

    /**
     * Service settings
     * 
     * @type {Object}
     */
    settings: {
        rest: true,

        fields: {

            // replica set name
            name: {
                type: "string",
                empty: false,
                required: true,
            },

            // replica set servers
            servers: {
                type: "array",
                required: false,
                default: [],
                populate: {
                    action: "v1.mongodb.servers.resolve",
                }
            },



            // inject dbservice fields
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
     * service actions
     */
    actions: {
        /**
         * add server to replica set
         * 
         * @actions
         * @param {String} id - replica set id
         * @param {String} server - server id
         * 
         * @returns {Object} 
         */
        addServer: {
            rest: {
                method: "POST",
                path: "/:id/server/:server",
            },
            params: {
                id: {
                    type: "string",
                    empty: false,
                    required: true,
                },
                server: {
                    type: "string",
                    empty: false,
                    required: true,
                }
            },
            async handler(ctx) {
                const { id, server } = ctx.params;

                // get replica set
                const replicaSet = await this.getById(id);

                // check if replica set exists
                if (!replicaSet) {
                    throw new MoleculerClientError("Replica set not found", 404, "REPLICA_SET_NOT_FOUND");
                }

                // get server
                const serverObj = await ctx.call("v1.mongodb.servers.resolve", { id: server });

                // check if server exists
                if (!serverObj) {
                    throw new MoleculerClientError("Server not found", 404, "SERVER_NOT_FOUND");
                }

                // add server to replica set
                const update = {
                    id: id,
                    $addToSet: {
                        servers: serverObj.id
                    }
                };

                // update replica set
                return this.updateEntity(ctx, update, { raw: true });
            }
        },

        /**
         * remove server from replica set
         * 
         * @actions
         * @param {String} id - replica set id
         * @param {String} server - server id
         * 
         * @returns {Object} 
         */
        removeServer: {
            rest: {
                method: "DELETE",
                path: "/:id/server/:server",
            },
            params: {
                id: {
                    type: "string",
                    empty: false,
                    required: true,
                },
                server: {
                    type: "string",
                    empty: false,
                    required: true,
                }
            },
            async handler(ctx) {
                const { id, server } = ctx.params;

                // get replica set
                const replicaSet = await this.getById(id);

                // check if replica set exists
                if (!replicaSet) {
                    throw new MoleculerClientError("Replica set not found", 404, "REPLICA_SET_NOT_FOUND");
                }

                // get server
                const serverObj = await ctx.call("v1.mongodb.servers.resolve", { id: server });

                // check if server exists
                if (!serverObj) {
                    throw new MoleculerClientError("Server not found", 404, "SERVER_NOT_FOUND");
                }

                // add server to replica set
                const update = {
                    id: id,
                    $pull: {
                        servers: serverObj.id
                    }
                };

                // update replica set
                return this.updateEntity(ctx, update, { raw: true });
            }
        },
    },

    /**
     * service events
     */
    events: {

    },

    /**
     * service methods
     */
    methods: {
        
    },


    /**
     * service created lifecycle event handler
     */
    created() {

    },

    /**
     * service started lifecycle event handler
     */
    async started() {

    },

    /**
     * service stopped lifecycle event handler
     */
    async stopped() {

    }
};
