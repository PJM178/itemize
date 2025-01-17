import type { IDBConfigRawJSONDataType, IRedisConfigRawJSONDataType, ISingleRedisConfigRawJSONDataType } from "../config";
import uuid from "uuid";
import fs from "fs";

export const TRUST_ALL_INBOUND_CONNECTIONS = process.env.TRUST_ALL_INBOUND_CONNECTIONS === "true";

// get the environment in order to be able to set it up
export const NODE_ENV: "development" | "production" = process.env.NODE_ENV as any || "development";
if (NODE_ENV !== "development" && NODE_ENV !== "production") {
  console.error("Unknown NODE_ENV ", NODE_ENV);
  process.exit(1);
}
export const PORT: number = process.env.PORT ? (parseInt(process.env.PORT) || 8000) : 8000;
export const INSTANCE_GROUP_ID = process.env.INSTANCE_GROUP_ID || "UNIDENTIFIED";
export const INSTANCE_MODE: "CLUSTER_MANAGER" | "GLOBAL_MANAGER" | "ABSOLUTE" | "EXTENDED" | "BUILD_DATABASE" | "LOAD_DATABASE_DUMP" | "CLEAN_STORAGE" = process.env.INSTANCE_MODE || "ABSOLUTE" as any;
export const GLOBAL_MANAGER_MODE: "ABSOLUTE" | "ELASTIC" | "SERVER_DATA" | "SERVICES" = process.env.GLOBAL_MANAGER_MODE || "ABSOLUTE" as any;
export const GLOBAL_MANAGER_SERVICES: string[] = (process.env.GLOBAL_MANAGER_SERVICES && process.env.GLOBAL_MANAGER_SERVICES.split(",").map((s) => s.trim())) || [];
export const INSTANCE_UUID =
  INSTANCE_MODE + "_" +
  (INSTANCE_MODE === "GLOBAL_MANAGER" ? GLOBAL_MANAGER_MODE + "_" : "") +
  (INSTANCE_MODE === "GLOBAL_MANAGER" && GLOBAL_MANAGER_MODE === "SERVICES" ? (GLOBAL_MANAGER_SERVICES.join(",") || "ALL_SERVICES") + "_" : "") +
  INSTANCE_GROUP_ID + "_" + uuid.v4().replace(/-/g, "");
export const INSTANCE_CREATION_TIME = new Date();
export const INSTANCE_LOG_FILE = `logs/info.${INSTANCE_UUID}.log`;
export const INSTANCE_LOG_ERROR_FILE = `logs/error.${INSTANCE_UUID}.log`;
export const REFRESH_ADMIN_PASSWORD = process.env.REFRESH_ADMIN_PASSWORD === "true";

export const DISABLE_CONSISTENCY_CHECKS = process.env.DISABLE_CONSISTENCY_CHECKS === "true";

if (
  INSTANCE_MODE !== "CLUSTER_MANAGER" &&
  INSTANCE_MODE !== "GLOBAL_MANAGER" &&
  INSTANCE_MODE !== "ABSOLUTE" &&
  INSTANCE_MODE !== "EXTENDED" &&
  INSTANCE_MODE !== "BUILD_DATABASE" &&
  INSTANCE_MODE !== "LOAD_DATABASE_DUMP" &&
  INSTANCE_MODE !== "CLEAN_STORAGE"
) {
  fs.writeFileSync(INSTANCE_LOG_ERROR_FILE, JSON.stringify({
    error: "Unknown INSTANCE_MODE",
    INSTANCE_MODE,
  }));
  console.error("Unknown INSTANCE_MODE ", INSTANCE_MODE);
  process.exit(1);
}

export const FAKE_SMS = process.env.FAKE_SMS === "true";
export const FAKE_EMAILS = process.env.FAKE_EMAILS === "true";
export const FAKE_USSD = process.env.FAKE_USSD === "true";
export const LOG_LEVEL: "debug" | "silly" | "info" | "error" = process.env.LOG_LEVEL as any || null;
if (
  LOG_LEVEL &&
  LOG_LEVEL !== "debug" &&
  LOG_LEVEL !== "silly" &&
  LOG_LEVEL !== "error" &&
  LOG_LEVEL !== "info"
) {
  fs.writeFileSync(INSTANCE_LOG_ERROR_FILE, JSON.stringify({
    error: "Unknown LOG_LEVEL",
    LOG_LEVEL,
  }));
  console.error("Unknown INSTANCE_MODE ", INSTANCE_MODE);
  process.exit(1);
}

export const CAN_LOG_DEBUG = LOG_LEVEL === "debug" || LOG_LEVEL === "silly" || (!LOG_LEVEL && process.env.NODE_ENV !== "production");
export const NO_SEO = process.env.NO_SEO === "true";
export const NO_SSR = process.env.NO_SSR === "true";
export const LOUD_SSR_ERRORS = process.env.LOUD_SSR_ERRORS === "true";

// FORCING STUFF
export const FORCE_ELASTIC_REBUILD = process.env.FORCE_ELASTIC_REBUILD === "true";
export const FORCE_CONSOLE_LOGS = process.env.FORCE_CONSOLE_LOGS === "true";

export const ENVIRONMENT_DETAILS = {
  INSTANCE_GROUP_ID,
  INSTANCE_MODE,
  INSTANCE_UUID,
  INSTANCE_CREATION_TIME,
  NO_SSR,
  NO_SEO,
  LOG_LEVEL,
  NODE_ENV,
};

export interface IEnvironmentInfo {
  nodeVersion: string;
  arch: string;
  platform: string;

  buildnumber: string;
  redisGlobal: ISingleRedisConfigRawJSONDataType;
  redisCache: ISingleRedisConfigRawJSONDataType;
  redisPubSub: ISingleRedisConfigRawJSONDataType;
  postgresql: IDBConfigRawJSONDataType;
  environment: typeof ENVIRONMENT_DETAILS;
}

export function buildEnvironmentInfo(
  buildnumber: string,
  redisConfig: IRedisConfigRawJSONDataType,
  databaseConfig: IDBConfigRawJSONDataType,
): IEnvironmentInfo {
  const redisGlobal = {...redisConfig.global};
  delete redisGlobal.password;

  const redisCache = {...redisConfig.cache};
  delete redisCache.password;

  const redisPubSub = {...redisConfig.pubSub};
  delete redisPubSub.password;

  const postgresql = {...databaseConfig};
  delete postgresql.password;
  delete postgresql.elasticLangAnalyzers;
  delete postgresql.dictionaries;

  return {
    nodeVersion: process.version,
    arch: process.arch,
    platform: process.platform,

    buildnumber,
    redisCache,
    redisGlobal,
    redisPubSub,
    postgresql,
    environment: ENVIRONMENT_DETAILS,
  };
}

export const EMULATE_ELASTIC_SYNC_FAILURE_AT = process.env.EMULATE_ELASTIC_SYNC_FAILURE_AT || null;
export const EMULATE_SILENT_ELASTIC_SYNC_FAILURE_AT = process.env.EMULATE_SILENT_ELASTIC_SYNC_FAILURE_AT || null;
export const ELASTIC_EXECUTE_CONSISTENCY_CHECKS_FROM_SCRATCH_AT = process.env.ELASTIC_EXECUTE_CONSISTENCY_CHECKS_FROM_SCRATCH_AT || null;
export const EMULATE_BAD_REDIS_WRITES = process.env.EMULATE_BAD_REDIS_WRITES === "true";

export const FORCE_ALL_OUTBOUND_MAIL_TO: string = process.env.FORCE_ALL_OUTBOUND_MAIL_TO || null;
export const FORCE_ALL_OUTBOUND_SMS_TO: string = process.env.FORCE_ALL_OUTBOUND_SMS_TO || null;