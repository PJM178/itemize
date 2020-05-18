"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_graphql_1 = __importDefault(require("express-graphql"));
const http_1 = __importDefault(require("http"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const Root_1 = __importDefault(require("../base/Root"));
const resolvers_1 = __importDefault(require("./resolvers"));
const gql_1 = require("../base/Root/gql");
const knex_1 = __importDefault(require("knex"));
const pg_1 = require("pg");
const constants_1 = require("../constants");
const errors_1 = require("../base/errors");
const PropertyDefinition_1 = __importDefault(require("../base/Root/Module/ItemDefinition/PropertyDefinition"));
const server_checkers_1 = require("../base/Root/Module/ItemDefinition/PropertyDefinition/server-checkers");
const rest_1 = __importDefault(require("./rest"));
const queries_1 = require("./user/queries");
const mutations_1 = require("./user/mutations");
const listener_1 = require("./listener");
const redis_1 = __importDefault(require("redis"));
const cache_1 = require("./cache");
const graphql_upload_1 = require("graphql-upload");
const custom_graphql_1 = require("./custom-graphql");
const mode_1 = require("./mode");
const triggers_1 = require("./user/triggers");
const ipstack_1 = require("./services/ipstack");
const mailgun_1 = require("./services/mailgun");
const rest_2 = require("./user/rest");
const pkgcloud_1 = __importDefault(require("pkgcloud"));
const here_1 = require("./services/here");
const util_1 = require("util");
const winston_1 = __importDefault(require("winston"));
require("winston-daily-rotate-file");
// building the logger
exports.logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV !== "production" ? "debug" : "info"),
    format: winston_1.default.format.json(),
    transports: [
        new winston_1.default.transports.DailyRotateFile({ filename: "logs/error.log", level: "error" }),
        new winston_1.default.transports.DailyRotateFile({ filename: "logs/info.log", level: "info" })
    ]
});
// if not production add a console.log
if (process.env.NODE_ENV !== "production") {
    exports.logger.add(new winston_1.default.transports.Console({
        format: winston_1.default.format.simple()
    }));
}
// Setting the parsers, postgresql comes with
// its own way to return this data and I want it
// to keep it in sync with all the data that we are
// currently using, first we set all the timezones to
// utc and then format it into what the client expects
// also do the same with time and date
const TIMESTAMP_OID = 1114;
const TIMESTAMPTZ_OID = 1184;
const TIME_OID = 1083;
const DATE_OID = 1082;
pg_1.types.setTypeParser(TIMESTAMP_OID, (val) => val);
pg_1.types.setTypeParser(TIMESTAMPTZ_OID, (val) => val);
pg_1.types.setTypeParser(TIME_OID, (val) => val);
pg_1.types.setTypeParser(DATE_OID, (val) => val);
const fsAsync = fs_1.default.promises;
const app = express_1.default();
/**
 * This is the function that catches the errors that are thrown
 * within graphql
 * @param error the error that is thrown
 */
const customFormatErrorFn = (error) => {
    const originalError = error.originalError;
    let constructor = null;
    if (originalError) {
        constructor = originalError.constructor;
    }
    let extensions;
    switch (constructor) {
        case errors_1.EndpointError:
            const gqlDataInputError = error.originalError;
            extensions = gqlDataInputError.data;
            break;
        default:
            exports.logger.error("customFormatErrorFn: Caught unexpected error from graphql parsing", {
                errMessage: error.originalError.message,
                errStack: error.originalError.stack,
            });
            extensions = {
                message: "Unspecified Error while parsing data",
                code: constants_1.ENDPOINT_ERRORS.UNSPECIFIED,
            };
    }
    return {
        extensions,
        ...error,
    };
};
/**
 * The resolve wrappers that wraps every resolve function
 * from graphql
 * @param fn the function that is supposed to run
 * @param source graphql source
 * @param args grapql args
 * @param context grapql context
 * @param info graphql info
 */
async function customResolveWrapper(fn, source, args, context, info) {
    try {
        return await fn(source, args, context, info);
    }
    catch (err) {
        if (err instanceof errors_1.EndpointError) {
            throw err;
        }
        exports.logger.error("customResolveWrapper: Found internal server error", {
            errStack: err.stack,
            errMessage: err.message,
        });
        throw new errors_1.EndpointError({
            message: "Internal Server Error",
            code: constants_1.ENDPOINT_ERRORS.INTERNAL_SERVER_ERROR,
        });
    }
}
/**
 * Initializes the server application with its configuration
 * @param appData the application data to use
 * @param custom the custom config that has been passed
 */
function initializeApp(appData, custom) {
    // removing the powered by header
    app.use((req, res, next) => {
        res.removeHeader("X-Powered-By");
        next();
    });
    // if we have a custom router and custom router endpoint rather than the standard
    if (custom.customRouterEndpoint) {
        app.use(custom.customRouterEndpoint, custom.customRouter(appData));
    }
    else if (custom.customRouter) {
        app.use(custom.customRouter(appData));
    }
    // adding rest services
    app.use("/rest/user", rest_2.userRestServices(appData));
    app.use("/rest", rest_1.default(appData));
    // custom graphql queries combined
    const allCustomQueries = {
        ...queries_1.customUserQueries(appData),
        ...(custom.customGQLQueries && custom.customGQLQueries(appData)),
        ...(custom.customTokenGQLQueries && custom_graphql_1.buildCustomTokenQueries(appData, custom.customTokenGQLQueries)),
    };
    // custom mutations combined
    const allCustomMutations = {
        ...mutations_1.customUserMutations(appData),
        ...(custom.customGQLMutations && custom.customGQLMutations(appData)),
    };
    // now we need to combine such queries with the resolvers
    const finalAllCustomQueries = {};
    Object.keys(allCustomQueries).forEach((customQueryKey) => {
        finalAllCustomQueries[customQueryKey] = {
            ...allCustomQueries[customQueryKey],
            resolve: customResolveWrapper.bind(null, allCustomQueries[customQueryKey].resolve),
        };
    });
    // do the same with the mutations
    const finalAllCustomMutations = {};
    Object.keys(allCustomMutations).forEach((customMutationKey) => {
        finalAllCustomMutations[customMutationKey] = {
            ...allCustomMutations[customMutationKey],
            resolve: customResolveWrapper.bind(null, allCustomMutations[customMutationKey].resolve),
        };
    });
    // now weadd the graphql endpoint
    app.use("/graphql", graphql_upload_1.graphqlUploadExpress({
        maxFileSize: constants_1.MAX_FILE_SIZE,
        maxFiles: constants_1.MAX_FILE_TOTAL_BATCH_COUNT,
        maxFieldSize: constants_1.MAX_FIELD_SIZE,
    }), express_graphql_1.default({
        schema: gql_1.getGQLSchemaForRoot(appData.root, finalAllCustomQueries, finalAllCustomMutations, resolvers_1.default(appData)),
        graphiql: true,
        customFormatErrorFn,
    }));
    // service worker setup
    app.get("/sw.development.js", (req, res) => {
        res.sendFile(path_1.default.resolve(path_1.default.join("dist", "data", "service-worker.development.js")));
    });
    app.get("/sw.production.js", (req, res) => {
        res.sendFile(path_1.default.resolve(path_1.default.join("dist", "data", "service-worker.production.js")));
    });
    // and now the main index setup
    app.get("*", (req, res) => {
        res.setHeader("content-type", "text/html; charset=utf-8");
        const mode = mode_1.getMode(appData, req);
        if (mode === "development") {
            res.end(appData.indexDevelopment);
        }
        else {
            res.end(appData.indexProduction);
        }
    });
}
/**
 * Provides the pkgloud client container from ovh
 * @param client the client to use
 * @param containerName the container name
 */
function getContainerPromisified(client, containerName) {
    return new Promise((resolve, reject) => {
        client.getContainer(containerName, (err, container) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(container);
            }
        });
    });
}
/**
 * Initializes the itemize server with its custom configuration
 * @param custom the customization details
 * @param custom.customGQLQueries custom graphql queries
 * @param custom.customTokenGQLQueries custom token graphql queries for generating custom tokens
 * while customGQLQueries can be used for the same purpose, this makes it easier and compliant
 * @param custom.customGQLMutations custom graphql mutations
 * @param custom.customRouterEndpoint an endpoint to add a custom router, otherwise it gets
 * attached to the root
 * @param custom.customRouter a custom router to attach to the rest endpoint
 * @param custom.customTriggers a registry for custom triggers
 */
async function initializeServer(custom = {}) {
    try {
        exports.logger.info("initializeServer: reading configuration data");
        // first let's read all the configurations
        let rawBuild;
        let rawConfig;
        let rawSensitiveConfig;
        let rawRedisConfig;
        let rawDbConfig;
        let index;
        let buildnumber;
        [
            rawConfig,
            rawSensitiveConfig,
            rawRedisConfig,
            rawDbConfig,
            index,
            rawBuild,
            buildnumber,
        ] = await Promise.all([
            fsAsync.readFile(path_1.default.join("dist", "config.json"), "utf8"),
            fsAsync.readFile(path_1.default.join("dist", "sensitive.json"), "utf8"),
            fsAsync.readFile(path_1.default.join("dist", "redis.json"), "utf8"),
            fsAsync.readFile(path_1.default.join("dist", "db.json"), "utf8"),
            fsAsync.readFile(path_1.default.join("dist", "data", "index.html"), "utf8"),
            fsAsync.readFile(path_1.default.join("dist", "data", "build.all.json"), "utf8"),
            fsAsync.readFile(path_1.default.join("dist", "buildnumber"), "utf8"),
        ]);
        const config = JSON.parse(rawConfig);
        const sensitiveConfig = JSON.parse(rawSensitiveConfig);
        const dbConfig = JSON.parse(rawDbConfig);
        const redisConfig = JSON.parse(rawRedisConfig);
        const build = JSON.parse(rawBuild);
        // redis configuration despite instructions actually tries to use null
        // values as it checks for undefined so we need to strip these if null
        Object.keys(redisConfig.cache).forEach((key) => {
            if (redisConfig.cache[key] === null) {
                delete redisConfig.cache[key];
            }
        });
        Object.keys(redisConfig.pubSub).forEach((key) => {
            if (redisConfig.pubSub[key] === null) {
                delete redisConfig.pubSub[key];
            }
        });
        Object.keys(redisConfig.global).forEach((key) => {
            if (redisConfig.global[key] === null) {
                delete redisConfig.global[key];
            }
        });
        // this shouldn't be necessary but we do it anyway
        buildnumber = buildnumber.replace("\n", "").trim();
        exports.logger.info("initializeServer: buildnumber is " + buildnumber);
        exports.logger.info("initializeServer: initializing itemize server root");
        const root = new Root_1.default(build);
        // Create the connection string
        const dbConnectionKnexConfig = {
            host: dbConfig.host,
            port: dbConfig.port,
            user: dbConfig.user,
            password: dbConfig.password,
            database: dbConfig.database,
        };
        exports.logger.info("initializeServer: setting up database connection to " + dbConfig.host);
        // we only need one client instance
        const knex = knex_1.default({
            client: "pg",
            debug: process.env.NODE_ENV !== "production",
            connection: dbConnectionKnexConfig,
        });
        exports.logger.info("initializeServer: initializing redis cache client");
        const redisClient = redis_1.default.createClient(redisConfig.cache);
        exports.logger.info("initializeServer: initializing redis global cache client");
        const redisGlobalClient = redis_1.default.createClient(redisConfig.global);
        exports.logger.info("initializeServer: initializing redis pub/sub client");
        const redisPub = redis_1.default.createClient(redisConfig.pubSub);
        const redisSub = redis_1.default.createClient(redisConfig.pubSub);
        PropertyDefinition_1.default.indexChecker = server_checkers_1.serverSideIndexChecker.bind(null, knex);
        // due to a bug in the types the create client function is missing
        // domainId and domainName
        exports.logger.info("initializeServer: initializing openstack pkgcloud objectstorage client");
        const pkgcloudStorageClient = pkgcloud_1.default.storage.createClient({
            provider: "openstack",
            username: sensitiveConfig.openStackUsername,
            keystoneAuthVersion: 'v3',
            region: sensitiveConfig.openStackRegion,
            domainId: "default",
            domainName: sensitiveConfig.openStackDomainName,
            password: sensitiveConfig.openStackPassword,
            authUrl: sensitiveConfig.openStackAuthUrl,
        });
        exports.logger.info("initializeServer: retrieving container " + sensitiveConfig.openStackUploadsContainerName);
        const pkgcloudUploadsContainer = await getContainerPromisified(pkgcloudStorageClient, sensitiveConfig.openStackUploadsContainerName);
        exports.logger.info("initializeServer: initializing cache instance");
        const cache = new cache_1.Cache(redisClient, knex, pkgcloudUploadsContainer, root);
        exports.logger.info("initializeServer: creating server");
        const server = http_1.default.createServer(app);
        exports.logger.info("initializeServer: setting up websocket socket.io listener");
        const listener = new listener_1.Listener(buildnumber, redisSub, redisPub, root, cache, knex, server);
        if (sensitiveConfig.ipStackAccessKey) {
            exports.logger.info("initializeServer: initializing ipstack connection");
        }
        const ipStack = sensitiveConfig.ipStackAccessKey ?
            ipstack_1.setupIPStack(sensitiveConfig.ipStackAccessKey) :
            null;
        if (sensitiveConfig.mailgunAPIKey && sensitiveConfig.mailgunDomain) {
            exports.logger.info("initializeServer: initializing mailgun connection");
        }
        const mailgun = sensitiveConfig.mailgunAPIKey && sensitiveConfig.mailgunDomain ?
            mailgun_1.setupMailgun({
                apiKey: sensitiveConfig.mailgunAPIKey,
                domain: sensitiveConfig.mailgunDomain,
            }) : null;
        if (sensitiveConfig.hereAppID && sensitiveConfig.hereAppCode) {
            exports.logger.info("initializeServer: initializing here maps");
        }
        const here = sensitiveConfig.hereAppID && sensitiveConfig.hereAppCode ?
            here_1.setupHere(sensitiveConfig.hereAppID, sensitiveConfig.hereAppCode) : null;
        exports.logger.info("initializeServer: configuring app data build");
        const appData = {
            root,
            indexDevelopment: index.replace(/\$MODE/g, "development"),
            indexProduction: index.replace(/\$MODE/g, "production"),
            config,
            sensitiveConfig,
            knex,
            listener,
            redis: redisClient,
            redisGlobal: redisGlobalClient,
            redisSub,
            redisPub,
            cache,
            buildnumber,
            triggers: {
                module: {},
                itemDefinition: {},
                ...triggers_1.customUserTriggers,
                ...custom.customTriggers,
            },
            ipStack,
            here,
            mailgun,
            pkgcloudStorageClient,
            pkgcloudUploadsContainer,
        };
        const flushAllPromisified = util_1.promisify(appData.redis.flushall).bind(appData.redis);
        exports.logger.info("initializeServer: flushing redis");
        await flushAllPromisified();
        exports.logger.info("initializeServer: setting up endpoints");
        initializeApp(appData, custom);
        exports.logger.info("initializeServer: attempting to listen");
        server.listen(config.port, () => {
            exports.logger.info("initializeServer: listening at " + config.port);
        });
    }
    catch (err) {
        exports.logger.error("initializeServer: Failed to initialize server due to error", {
            errMessage: err.message,
            errStack: err.stack,
        });
        process.exit(1);
    }
}
exports.initializeServer = initializeServer;
