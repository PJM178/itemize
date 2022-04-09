import type { IDBConfigRawJSONDataType, IRedisConfigRawJSONDataType, ISingleRedisConfigRawJSONDataType } from "../config";
import uuid from "uuid";

// get the environment in order to be able to set it up
export const NODE_ENV: "development" | "production" = process.env.NODE_ENV as any || "development";
if (NODE_ENV !== "development" && NODE_ENV !== "production") {
  console.error("Unknown NODE_ENV ", NODE_ENV);
  process.exit(1);
}
export const PORT: number = process.env.PORT ? (parseInt(process.env.PORT) || 8000) : 8000;
export const INSTANCE_GROUP_ID = process.env.INSTANCE_GROUP_ID || "UNIDENTIFIED";
export const INSTANCE_MODE: "CLUSTER_MANAGER" | "GLOBAL_MANAGER" | "ABSOLUTE" | "EXTENDED" | "BUILD_DATABASE" | "LOAD_DATABASE_DUMP" | "CLEAN_STORAGE" | "CLEAN_SITEMAPS" = process.env.INSTANCE_MODE || "ABSOLUTE" as any;
export const INSTANCE_UUID = uuid.v4().replace(/-/g, "");
export const INSTANCE_CREATION_TIME = new Date();

if (
  INSTANCE_MODE !== "CLUSTER_MANAGER" &&
  INSTANCE_MODE !== "GLOBAL_MANAGER" &&
  INSTANCE_MODE !== "ABSOLUTE" &&
  INSTANCE_MODE !== "EXTENDED" &&
  INSTANCE_MODE !== "BUILD_DATABASE" &&
  INSTANCE_MODE !== "LOAD_DATABASE_DUMP" &&
  INSTANCE_MODE !== "CLEAN_SITEMAPS" &&
  INSTANCE_MODE !== "CLEAN_STORAGE"
) {
  console.error("Unknown INSTANCE_MODE ", INSTANCE_MODE);
  process.exit(1);
}

export const USING_DOCKER = process.env.USING_DOCKER === "true";
export const PING_GOOGLE = process.env.PING_GOOGLE === "true";
export const FAKE_SMS = process.env.FAKE_SMS === "true";
export const FAKE_EMAILS = process.env.FAKE_EMAILS === "true";
export const LOG_LEVEL: "debug" | "silly" | "info" = process.env.LOG_LEVEL as any || null;
if (
  LOG_LEVEL &&
  LOG_LEVEL !== "debug" &&
  LOG_LEVEL !== "silly" &&
  LOG_LEVEL !== "info"
) {
  console.error("Unknown LOG_LEVEL ", LOG_LEVEL);
  process.exit(1);
}

export const CAN_LOG_DEBUG = LOG_LEVEL === "debug" || LOG_LEVEL === "silly" || (!LOG_LEVEL && process.env.NODE_ENV !== "production");
export const CAN_LOG_SILLY = LOG_LEVEL === "silly";
export const NO_SEO = process.env.NO_SEO === "true";
export const NO_SSR = process.env.NO_SSR === "true";

export const ENVIRONMENT_DETAILS = {
  INSTANCE_GROUP_ID,
  INSTANCE_MODE,
  INSTANCE_UUID,
  INSTANCE_CREATION_TIME,
  NO_SSR,
  NO_SEO,
  LOG_LEVEL,
  PING_GOOGLE,
  USING_DOCKER,
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