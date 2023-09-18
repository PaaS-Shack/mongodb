const { ServiceBroker, Context } = require("moleculer");
const { ValidationError } = require("moleculer").Errors;

const config = require("../moleculer.config");

const MongodbDatabaseSchema = require("../services/databases.service");
const MongodbServerSchema = require("../services/servers.service");
const MongodbUserSchema = require("../services/users.service");
const MongodbProvisionsSchema = require("../services/provisions.service");

jest.setTimeout(60000)

describe("Test 'mongodb' actions", () => {
    config.logger = false;
    let broker = new ServiceBroker(config);

    broker.createService(MongodbDatabaseSchema);
    broker.createService(MongodbServerSchema);
    broker.createService(MongodbUserSchema);
    broker.createService(MongodbProvisionsSchema);

    // load user id from v1.accounts.find
    const options = { meta: { userID: '' } }

    beforeAll(async () => {
        await broker.start()

        options.meta.userID = await broker.call("v1.accounts.find", {
            limit: 1
        }).then(res => {
            return res[0].id;
        });
        return Promise.resolve();
    });
    afterAll(async () => {
        await broker.stop();
        return Promise.resolve();

    });

    describe("Test 'provisions' action", () => {

        const config = {
            id: '12345678901234567890',
        }

        it("should return a encoded database id", async () => {
            // call the action
            const id = await broker.call("v1.mongodb.provisions.provision", {
                zone: "us-east-1",
            }, options);

            // Check the result is a string id
            expect(id).toEqual(expect.any(String));
            expect(id.length).toBe(20);
            // save the id for the next test
            config.id = id;

            return Promise.resolve();
        });

        it("should return a database object", async () => {
            // call the action
            const database = await broker.call("v1.mongodb.provisions.get", {
                id: config.id
            }, options);

            // Check the result is a string id
            expect(database).toEqual(expect.any(Object));
            expect(database.id).toEqual(config.id);
            return Promise.resolve();
        });

        it("should return a list of databases", async () => {
            // call the action
            const databases = await broker.call("v1.mongodb.provisions.find", {}, options);

            // Check the result is a string id
            expect(databases).toEqual(expect.any(Array));
            expect(databases.length).toBeGreaterThan(0);
            return Promise.resolve();
        });

        it("should return a object when pack is called", async () => {
            // call the action
            const database = await broker.call("v1.mongodb.provisions.pack", {
                id: config.id
            }, options);

            // Check the result is a string id
            expect(database).toEqual(expect.any(Object));
            expect(database.MONGO_URI).toEqual(expect.any(String));
            return Promise.resolve();

        })

        it("should return a string id when deprovision is called", async () => {
            // call the action
            const id = await broker.call("v1.mongodb.provisions.deprovision", {
                id: config.id
            }, options);

            // Check the result is a string id
            expect(id).toEqual(expect.any(String));
            expect(id.length).toBe(20);
            expect(id).toBe(config.id);

            return Promise.resolve();
        })




    });
});