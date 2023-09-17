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
