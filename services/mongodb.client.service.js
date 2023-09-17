"use strict";

const DbService = require("db-mixin");
const Membership = require("membership-mixin");
const generator = require('generate-password');
const Cron = require('cron-mixin');

const { MoleculerClientError } = require("moleculer").Errors;
const { MongoClient } = require('mongodb')

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

/**
 * this services manages a pool of mongodb clients
 * 
 */
module.exports = {
    name: "mongodb.client",
    version: 1,

    mixins: [

    ],

    /**
     * Service dependencies
     */
    dependencies: [
        'v1.mongodb.servers'
    ],
    /**
     * Service settings
     */
    settings: {
        rest: "/v1/mongodb/client/",

    },


    /**
     * Actions
     */

    actions: {


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
        this.clients = new Map()
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
