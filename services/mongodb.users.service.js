"use strict";



const DbService = require("db-mixin");
const Membership = require("membership-mixin");
const ConfigLoader = require("config-mixin");

const { MoleculerClientError } = require("moleculer").Errors;


const MongoMixin = require("../mixins/mongodb.mixin");

/**
 * this service maanges mongodb users
 */
module.exports = {
    name: "mongodb.users",
    version: 1,

    mixins: [
        DbService({
            permissions: "mongodb.users",
        }),
        ConfigLoader(['mongodb.**']),
        MongoMixin
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
        rest: "/v1/mongodb/users/",

        fields: {

            // mongodb user name
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
                description: "mongodb user name"
            },

            // mongodb user password
            password: {
                type: "string",
                required: true,
                min: 8,
                max: 50,
                description: "mongodb user password"
            },

            // mongodb user roles
            roles: {
                type: "array",
                items: "string",
                required: false,
                default: [],
                enum: [
                    "read",
                    "readWrite",
                    "dbAdmin",
                    "dbOwner",
                    "userAdmin",
                    "clusterAdmin",
                    "clusterManager",
                    "clusterMonitor",
                    "hostManager",
                    "backup",
                    "restore",
                    "readAnyDatabase",
                    "readWriteAnyDatabase",
                    "userAdminAnyDatabase",
                    "dbAdminAnyDatabase",
                    "root",
                    "dbOwner",
                    "restore",
                    "backup",
                    "readWrite",
                    "read",
                    "readWriteAnyDatabase",
                    "readAnyDatabase",
                    "userAdminAnyDatabase",
                    "dbAdminAnyDatabase",
                    "clusterAdmin",
                    "clusterManager",
                    "clusterMonitor",
                    "hostManager"
                ],
                description: "mongodb user roles"
            },

            // mongodb user privileges
            privileges: {
                type: "array",
                items: "string",
                required: false,
                default: [],
                enum: [
                    "createCollection",
                    "createIndex",
                    "createRole",
                    "createUser",
                    "dbAdmin",
                    "dbAdminAnyDatabase",
                    "dbOwner",
                    "dbOwnerAnyDatabase",
                    "enableProfiler",
                    "enableSharding",
                    "grantRole",
                    "indexTag",
                    "insert",
                    "insertAnyDatabase",
                    "killAnyCursor",
                    "killCursors",
                    "listCollections",
                    "listDatabases",
                    "listIndexes",
                    "listRoles",
                    "listShards",
                    "listUsers",
                    "read",
                    "readAnyDatabase",
                    "readWrite",
                    "readWriteAnyDatabase",
                    "remove",
                    "removeAnyDatabase",
                    "revokeRole",
                    "serverStatus",
                    "setFCV",
                    "shardCollection",
                    "update",
                    "updateAnyDatabase",
                    "viewRole",
                    "viewUser"
                ],
                description: "mongodb user privileges"
            },

            // mongodb user authentication database
            authdb: {
                type: "string",
                required: false,
                default: "admin",
                description: "mongodb user authentication database"
            },

            // mongodb user databases
            databases: {
                type: "array",
                items: "string",
                required: false,
                default: [],
                description: "mongodb user databases",
                populate: {
                    action: "v1.mongodb.databases.resolve",
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
         * get mongodb user info
         * 
         * @param {String} id - mongodb user id
         * 
         * @returns {Object} mongodb user
         */
        info: {
            rest: {
                method: "GET",
                path: "/:id/info",
            },
            permissions: ['mongodb.users.info'],
            params: {
                id: {
                    type: "string",
                    optional: false,
                    description: "mongodb user id",
                }
            },
            async handler(ctx) {
                const params = Object.assign({}, ctx.params);

                // get mongodb user
                const user = await this.resolveEntities(null, {
                    id: params.id,
                })

                // check if mongodb user exists
                if (!user) {
                    throw new MoleculerClientError("mongodb user not found", 404);
                }


                const results = [];

                // loop over db servers and get user info
                for (const id of user.databases) {

                    // resolve server object
                    const database = await ctx.call('v1.mongodb.databases.resolve', {
                        id: id,
                        populate: ['server']
                    });

                    const result = await this.getUserInfo(ctx, user, database.server, database);

                    results.push(result);
                }


                // return mongodb user
                return results;
            }
        },

        /**
         * create not found mongodb user
         * 
         * @param {String} id - mongodb user id
         * 
         * @returns {Object} mongodb user
         */
        createNotFound: {
            rest: {
                method: "POST",
                path: "/:id/createNotFound",
            },
            permissions: ['mongodb.users.createNotFound'],
            params: {
                id: {
                    type: "string",
                    optional: false,
                    description: "mongodb user id",
                }
            },
            async handler(ctx) {
                const params = Object.assign({}, ctx.params);

                // get mongodb user
                const user = await this.resolveEntities(null, {
                    id: params.id,
                });

                // check if mongodb user exists
                if (!user) {
                    throw new MoleculerClientError("mongodb user not found", 404);
                }

                this.logger.info(`creating mongodb user ${user.name} not found`);

                for (const id of user.databases) {

                    // resolve server object
                    const database = await ctx.call('v1.mongodb.databases.resolve', {
                        id: id,
                        populate: ['server']
                    });

                    const info = await this.getUserInfo(ctx, user, database.server, database);

                    if (info) {
                        this.updateUser(ctx, user, database.server, database);
                    } else {
                        await this.createUser(ctx, user, database.server, database);
                    }

                }

                // return mongodb user
                return user;
            }
        },

        /**
         * drop user
         * 
         * @actions
         * @param {String} id - mongodb user id
         * 
         * @returns {Object} mongodb user
         */
        drop: {
            rest: {
                method: "POST",
                path: "/:id/drop",
            },
            permissions: ['mongodb.users.drop'],
            params: {
                id: {
                    type: "string",
                    optional: false,
                    description: "mongodb user id",
                }
            },
            async handler(ctx) {
                const params = Object.assign({}, ctx.params);

                // get mongodb user
                const user = await this.resolveEntities(null, {
                    id: params.id,
                })

                // check if mongodb user exists
                if (!user) {
                    throw new MoleculerClientError("mongodb user not found", 404);
                }

                // loop over db servers and get user info
                for (const id of user.databases) {

                    // resolve server object
                    const database = await ctx.call('v1.mongodb.databases.resolve', {
                        id: id,
                        populate: ['server']
                    });

                    await this.deleteUser(ctx, user, database.server, database)
                        .catch((error) => {
                            this.logger.error(error);
                        });
                }

                this.logger.info(`dropped mongodb user ${user.name}`);

                // delete mongodb user
                return this.removeEntity(ctx, {
                    id: params.id,
                });
            }
        },

        /**
         * grant mongodb user roles
         * 
         * @actions
         * @param {String} id - mongodb user id
         * @param {Array} roles - mongodb user roles
         * 
         * @returns {Object} mongodb user
         */
        grantRoles: {
            rest: {
                method: "POST",
                path: "/:id/grantRoles",
            },
            permissions: ['mongodb.users.grantRoles'],
            params: {
                id: {
                    type: "string",
                    optional: false,
                    description: "mongodb user id",
                },
                roles: {
                    type: "array",
                    items: "string",
                    optional: false,
                    description: "mongodb user roles",
                    enum: [
                        "read",
                        "readWrite",
                        "dbAdmin",
                        "dbOwner",
                        "userAdmin",
                        "clusterAdmin",
                        "clusterManager",
                        "clusterMonitor",
                        "hostManager",
                        "backup",
                        "restore",
                        "readAnyDatabase",
                        "readWriteAnyDatabase",
                        "userAdminAnyDatabase",
                        "dbAdminAnyDatabase",
                        "root",
                        "dbOwner",
                        "restore",
                        "backup",
                        "readWrite",
                        "read",
                        "readWriteAnyDatabase",
                        "readAnyDatabase",
                        "userAdminAnyDatabase",
                        "dbAdminAnyDatabase",
                        "clusterAdmin",
                        "clusterManager",
                        "clusterMonitor",
                        "hostManager"
                    ],
                },
            },
            async handler(ctx) {
                const params = Object.assign({}, ctx.params);

                // get mongodb user
                let user = await this.resolveEntities(null, {
                    id: params.id,
                })

                // check if mongodb user exists
                if (!user) {
                    throw new MoleculerClientError("mongodb user not found", 404);
                }

                // update user roles
                user = await this.updateEntity(null, {
                    id: params.id,
                    roles: user.roles.concat(params.roles)
                });

                // loop over db servers and get user info
                for (const id of user.databases) {

                    // resolve server object
                    const database = await ctx.call('v1.mongodb.databases.resolve', {
                        id: id,
                        populate: ['server']
                    });

                    await this.grantRoles(ctx, user, database.server, database, params.roles);
                }

                this.logger.info(`granted mongodb user ${user.name} roles ${params.roles}`);

                // return mongodb user
                return user;
            }
        },

        /**
         * revoke mongodb user roles
         * 
         * @actions
         * @param {String} id - mongodb user id
         * @param {Array} roles - mongodb user roles
         * 
         * @returns {Object} mongodb user
         */
        revokeRoles: {
            rest: {
                method: "POST",
                path: "/:id/revokeRoles",
            },
            permissions: ['mongodb.users.revokeRoles'],
            params: {
                id: {
                    type: "string",
                    optional: false,
                    description: "mongodb user id",
                },
                roles: {
                    type: "array",
                    items: "string",
                    optional: false,
                    description: "mongodb user roles",
                    enum: [
                        "read",
                        "readWrite",
                        "dbAdmin",
                        "dbOwner",
                        "userAdmin",
                        "clusterAdmin",
                        "clusterManager",
                        "clusterMonitor",
                        "hostManager",
                        "backup",
                        "restore",
                        "readAnyDatabase",
                        "readWriteAnyDatabase",
                        "userAdminAnyDatabase",
                        "dbAdminAnyDatabase",
                        "root",
                        "dbOwner",
                        "restore",
                        "backup",
                        "readWrite",
                        "read",
                        "readWriteAnyDatabase",
                        "readAnyDatabase",
                        "userAdminAnyDatabase",
                        "dbAdminAnyDatabase",
                        "clusterAdmin",
                        "clusterManager",
                        "clusterMonitor",
                        "hostManager"
                    ],
                },
            },
            async handler(ctx) {
                const params = Object.assign({}, ctx.params);

                // get mongodb user
                let user = await this.resolveEntities(null, {
                    id: params.id,
                })

                // check if mongodb user exists
                if (!user) {
                    throw new MoleculerClientError("mongodb user not found", 404);
                }

                // update user roles
                user = await this.updateEntity(null, {
                    id: params.id,
                    roles: user.roles.filter((role) => {
                        return !params.roles.includes(role);
                    })
                });

                // loop over db servers and get user info
                for (const id of user.databases) {

                    // resolve server object
                    const database = await ctx.call('v1.mongodb.databases.resolve', {
                        id: id,
                        populate: ['server']
                    });

                    await this.revokeRoles(ctx, user, database.server, database, params.roles);
                }

this.logger.info(`revoked mongodb user ${user.name} roles ${params.roles}`);

                // return mongodb user
                return user;
            }
        },
    },

    /**
     * Events
     */
    events: {
        async "v1.mongodb.users.created"(ctx) {
            const user = ctx.params.data;

            for (const database of user.databases) {

                // resolve server object
                const server = await ctx.call('v1.mongodb.servers.resolve', {
                    id: database.server
                });

                await this.createUser(ctx, user, server, database);
            }

        },
    },

    /**
     * Methods
     */
    methods: {
        /**
         * create user
         * 
         * @param {Object} ctx - context of the request
         * @param {Object} user - mongodb user
         * @param {Object} server - mongodb server
         * @param {Object} database - mongodb database
         * 
         * @returns {Object} mongodb user
         */
        async createUser(ctx, user, server, database) {
            // get mongodb client
            const client = await this.getClient(ctx, server);

            // get mongodb database
            const db = client.db('admin');

            // create user
            const result = await db.command({
                createUser: user.name,
                pwd: user.password,
                roles: user.roles.map((role) => {
                    return {
                        role: role,
                        db: database.name
                    }
                }),
                // privileges: user.privileges
            });

            // get mongodb user
            const dbUser = await this.getUserInfo(ctx, user, server, database);

this.logger.info(`Mongodb command createUser ${user.name}`);

            // return mongodb user
            return dbUser;
        },

        /**
         * update user
         * 
         * @param {Object} ctx - context of the request
         * @param {Object} user - mongodb user
         * @param {Object} server - mongodb server
         * @param {Object} database - mongodb database
         * 
         * @returns {Object} mongodb user
         */
        async updateUser(ctx, user, server, database) {
            // get mongodb client
            const client = await this.getClient(ctx, server);

            // get mongodb database
            const db = client.db('admin');

            // update user
            const result = await db.command({
                updateUser: user.name,
                pwd: user.password,
                roles: user.roles.map((role) => {
                    return {
                        role: role,
                        db: database.name
                    }
                }),
                // privileges: user.privileges
            });

            // get mongodb user
            const dbUser = await this.getUserInfo(ctx, user, server, database);

this.logger.info(`Mongodb command updateUser ${user.name}`);

            // return mongodb user
            return dbUser;
        },

        /**
         * delete user
         * 
         * @param {Object} ctx - context of the request
         * @param {Object} user - mongodb user
         * @param {Object} server - mongodb server
         * @param {Object} database - mongodb database
         * 
         * @returns {Object} mongodb user
         */
        async deleteUser(ctx, user, server, database) {
            // get mongodb client
            const client = await this.getClient(ctx, server);

            // get mongodb database
            const db = client.db('admin');

            // delete user
            const result = await db.command({
                dropUser: user.name,
            });

this.logger.info(`Mongodb command dropUser ${user.name}`);

            // return mongodb user
            return result;
        },

        /**
         * get mongodb user info
         * 
         * @param {Object} ctx - context of the request
         * @param {Object} user - mongodb user
         * @param {Object} server - mongodb server
         * @param {Object} database - mongodb database
         * 
         * @returns {Object} mongodb user
         */
        async getUserInfo(ctx, user, server, database) {
            // get mongodb client
            const client = await this.getClient(ctx, server);

            // get mongodb database
            const db = client.db('admin');

            // get mongodb user
            const dbUser = await db.command({
                usersInfo: `${user.name}`
            });

            // return mongodb user
            return dbUser.users[0];
        },

        /**
         * grant mongodb user roles
         * 
         * @param {Object} ctx - context of the request
         * @param {Object} user - mongodb user
         * @param {Object} server - mongodb server
         * @param {Object} database - mongodb database
         * @params {Array} roles - mongodb user roles
         * 
         * @returns {Object} mongodb user
         */
        async grantRoles(ctx, user, server, database, roles) {
            // get mongodb client
            const client = await this.getClient(ctx, server);

            // get mongodb database
            const db = client.db('admin');

            // grant roles
            const result = await db.command({
                grantRolesToUser: user.name,
                roles: roles.map((role) => {
                    return {
                        role: role,
                        db: database.name
                    }
                }),
            });
            this.logger.info(`Mongodb command grantRolesToUser ${user.name} ${roles}`);
            // return mongodb user
            return result;
        },

        /**
         * revoke mongodb user roles
         * 
         * @param {Object} ctx - context of the request
         * @param {Object} user - mongodb user
         * @param {Object} server - mongodb server
         * @param {Object} database - mongodb database
         * @params {Array} roles - mongodb user roles
         * 
         * @returns {Object} mongodb user
         */
        async revokeRoles(ctx, user, server, database, roles) {
            // get mongodb client
            const client = await this.getClient(ctx, server);

            // get mongodb database
            const db = client.db('admin');

            // revoke roles
            const result = await db.command({
                revokeRolesFromUser: user.name,
                roles: roles.map((role) => {
                    return {
                        role: role,
                        db: database.name
                    }
                }),
            });
            this.logger.info(`Mongodb command revokeRolesFromUser ${user.name} ${roles}`);

            // return mongodb user
            return result;
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
