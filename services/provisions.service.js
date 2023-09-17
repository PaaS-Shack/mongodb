"use strict";



const DbService = require("db-mixin");
const Membership = require("membership-mixin");
const ConfigLoader = require("config-mixin");

const { MoleculerClientError } = require("moleculer").Errors;

const generator = require('generate-password');

/**
 * this service maanges mongodb provisions for user and databases
 */
module.exports = {
    name: "mongodb.provisions",
    version: 1,

    mixins: [
        DbService({
            permissions: "mongodb.provisions"
        }),
        Membership({
            permissions: "mongodb.provisions"
        }),
        ConfigLoader(['k8s.**'])
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
        rest: "/v1/mongodb/provisions/",

        fields: {

            database: {
                type: "string",
                optional: true,
                populate: {
                    action: "v1.mongodb.databases.get",
                },
            },

            user: {
                type: "string",
                optional: true,
                populate: {
                    action: "v1.mongodb.users.get",
                },
            },



            ...DbService.FIELDS,// inject dbservice fields
            ...Membership.FIELDS,// inject membership fields
        },
        defaultPopulates: [],

        scopes: {
            ...DbService.SCOPE,
            ...Membership.SCOPE,
        },

        defaultScopes: [...DbService.DSCOPE, ...Membership.DSCOPE],

        // default init config settings
        config: {

        }
    },

    /**
     * Actions
     */

    actions: {
        /**
         * override the base create action
         */
        create: {
            rest: false,
        },
        /**
         * provision a new mongodb user and database
         * 
         * @actions
         * @param {String} zone - zone to provision in
         * @param {String} prefix - prefix for the provision
         * 
         * @returns {Object} provision - the provision object
         */
        provision: {
            rest: "POST /",
            permissions: ['mongodb.provisions.provision'],
            params: {
                zone: { type: "string", optional: true },
                prefix: { type: "string", default: 'provision', optional: true },
            },
            async handler(ctx) {
                const params = Object.assign({}, ctx.params);
                const { zone, prefix } = params;

                // get server in zone
                const server = await ctx.call('v1.mongodb.servers.lookup', {
                    zone,
                    status: 'active',
                });

                const databaseName = this.generatePrefixName(params);
                //create the database
                const database = await ctx.call('v1.mongodb.databases.create', {
                    name: databaseName,
                    server: server.id,
                });

                const userName = this.generatePrefixName(params);
                const userPassword = generator.generate({
                    length: 10,
                    numbers: true
                });
                // create the user
                const user = await ctx.call('v1.mongodb.users.create', {
                    name: userName,
                    password: userPassword,
                    roles: [
                        'readWrite',

                    ],
                    databases: [database.id],
                });


                // create the provision
                const provision = await this.createEntity(ctx, {
                    user: user.id,
                    database: database.id,
                });

                await ctx.call('v1.mongodb.users.createNotFound', {
                    id: user.id
                })
                this.logger.info(`provisioned mongodb user ${user.name} and database ${database.name}`);
                // return provision id
                return provision.id;
            }
        },

        /**
         * pack the provision into a object
         * 
         * @actions
         * @param {String} id - the provision id
         * 
         * @returns {Object} provision - the provision object
         */
        pack: {
            rest: "GET /:id/pack",
            permissions: ['mongodb.provisions.pack'],
            params: {
                id: { type: "string" },
            },
            async handler(ctx) {
                const params = Object.assign({}, ctx.params);

                // get provision
                const provision = await this.resolveEntities(ctx, {
                    id: params.id,
                    populate: ['user', 'database'],
                });

                // resolve server
                const server = await ctx.call('v1.mongodb.servers.get', {
                    id: provision.database.server,
                });

                this.logger.info(`packed mongodb provision ${provision.id}`);

                return {
                    MONGO_USERNAME: provision.user.name,
                    MONGO_PASSWORD: provision.user.password,
                    MONGO_DATABASE: provision.database.name,
                    MONGO_HOST: server.host,
                    MONGO_PORT: server.port,
                    MONGO_URI: `mongodb://${provision.user.name}:${provision.user.password}@${server.host}:${server.port}/${provision.database.name}?authSrouce=admin`
                };
            }
        },

        /**
         * deprovision a provision
         * 
         * @actions
         * @param {String} id - the provision id
         * 
         * @returns {Object} provision - the provision object
         */
        deprovision: {
            rest: {
                method: "DELETE",
                path: "/:id"
            },
            permissions: ['mongodb.provisions.deprovision'],
            params: {
                id: { type: "string" },
            },
            async handler(ctx) {
                const params = Object.assign({}, ctx.params);
                // get provision
                const provision = await this.resolveEntities(ctx, {
                    id: params.id,
                })

                await ctx.call('v1.mongodb.users.drop', {
                    id: provision.user,
                }).catch(err => {
                    this.logger.error(err);
                });

                await ctx.call('v1.mongodb.databases.drop', {
                    id: provision.database,
                }).catch(err => {
                    this.logger.error(err);
                });

                this.logger.info(`deprovisioned mongodb provision ${provision.id}`);

                // delete provision
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
        /**
         * generate prefix name
         * 
         * @param {Object} params - params object
         * 
         * @returns {String} prefix name 
         */
        generatePrefixName(params) {
            const code = generator.generate({
                length: 4,
                numbers: true
            })
            return `${params.prefix}_${code}`;
        },
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
