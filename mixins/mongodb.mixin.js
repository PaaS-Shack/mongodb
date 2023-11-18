

const { MoleculerClientError } = require("moleculer").Errors;
const { MongoClient } = require('mongodb');

/**
 * mongodb client functions mixin
 */

const ClientEvents = [
    "error", "timeout", "close", "open", "serverOpening", "serverClosed",
    "serverDescriptionChanged", "topologyOpening", "topologyClosed",
    "topologyDescriptionChanged", "connectionPoolCreated", "connectionPoolClosed",
    "connectionPoolCleared", "connectionPoolReady", "connectionCreated",
    "connectionReady", "connectionClosed", "connectionCheckOutStarted",
    "connectionCheckOutFailed", "connectionCheckedOut", "connectionCheckedIn",
    "commandStarted", "commandSucceeded", "commandFailed", "serverHeartbeatStarted",
    "serverHeartbeatSucceeded", "serverHeartbeatFailed"
]

module.exports = {
    methods: {
        /**
         * create mongodb client
         * 
         * @param {Object} ctx - context of the request
         * @param {Object} server - mongodb server
         * 
         * @returns {Object} mongodb client
         */
        async createClient(ctx, server) {

            // check if client already exists
            if (this.clients.has(server.id)) {
                return this.clients.get(server.id);
            }

            const uri = await this.createUri(ctx, server);

            // create client
            const client = await MongoClient.connect(uri);

            // store client
            this.clients.set(server.id, client);

            // add event handlers
            ClientEvents.forEach(event => {
                client.on(event, (...args) => {
                    this.logger.debug(`mongodb.client.${event}`, ...args)
                });
            });

            this.logger.info(`mongodb client created for server ${server.id}`);

            // create timeout to close client
            client._timeout = setTimeout(async () => {
                await this.closeClient(ctx, server);
            }, 150000);// 2.5 minutes

            return client;
        },

        /**
         * create uri
         * 
         * @param {Object} ctx - context of the request
         * @param {Object} server - mongodb server
         */
        async createUri(ctx, server) {
            let authPart = '';

            const rootUser = server.root.roles.includes('root')

            if (rootUser) {
                authPart = `${server.root.name}:${server.root.password}@`
            }

            let dbPart = '';
            if (server.database) {
                dbPart = `${server.database.name}`
            }

            let uri = `mongodb://${authPart}${server.host}:${server.port}/${dbPart}?serverSelectionTimeoutMS=150000`

            uri += `&directConnection=true`

            return uri;
        },


        /**
         * get mongodb client
         * 
         * @param {Object} ctx - context of the request
         * @param {Object} server - mongodb server
         * 
         * @returns {Object} mongodb client
         */
        async getClient(ctx, server) {

            // check if client already exists
            if (this.clients.has(server.id)) {
                return this.clients.get(server.id);
            }

            // create client
            const client = await this.createClient(ctx, server);

            return client;
        },

        /**
         * close mongodb client
         * 
         * @param {Object} ctx - context of the request
         * @param {Object} server - mongodb server
         * 
         * @returns {Object} mongodb client
         */
        async closeClient(ctx, server) {

            // check if client already exists
            if (this.clients.has(server.id)) {
                const client = this.clients.get(server.id);
                await client.close();
                clearTimeout(client._timeout)
                this.clients.delete(server.id);

                this.logger.info(`mongodb client closed for server ${server.id}`);

                return client;
            }

            return null;
        },

        /**
         * close all mongodb clients 
         * 
         * @param {Object} ctx - context of the request
         * 
         * @returns {Object} mongodb client
         */
        async closeClients(ctx) {

            // close all clients
            for (const [id, client] of this.clients) {
                await client.close();
                this.clients.delete(id);
            }

            return this.clients;
        },

    },

    /**
     * Service created lifecycle event handler
     */
    created() {
        this.clients = new Map()
    },

    /**
     * Service stopped lifecycle event handler
     */
    async stopped() {
        await this.closeClients(this.broker);
    }
};