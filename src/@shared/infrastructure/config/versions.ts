/**
 * API Version Configuration
 * Defines available API versions and their metadata
 */

export enum ApiVersion {
  V1 = "v1",
  V2 = "v2",
}

export interface VersionConfig {
  version: ApiVersion;
  basePath: string;
  isDeprecated: boolean;
  deprecationDate?: Date;
  sunsetDate?: Date;
  description: string;
}

export const API_VERSIONS: Record<ApiVersion, VersionConfig> = {
  [ApiVersion.V1]: {
    version: ApiVersion.V1,
    basePath: "/api/v1",
    isDeprecated: false,
    description: "Initial API version - Returns simple greeting message",
  },
  [ApiVersion.V2]: {
    version: ApiVersion.V2,
    basePath: "/api/v2",
    isDeprecated: false,
    description:
      "Enhanced API version - Includes timestamp and version information",
  },
};

export const DEFAULT_VERSION = ApiVersion.V1;
export const LATEST_VERSION = ApiVersion.V2;
