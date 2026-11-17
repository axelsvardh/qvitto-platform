// Spec 002: staging environment. Customer-app acceptance criteria.

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

const loadApi = () => {
  let mod;
  jest.isolateModules(() => {
    mod = require("../api/api");
  });
  return mod;
};

afterEach(() => {
  delete process.env.EXPO_PUBLIC_API_URL;
});

test("AC5: EXPO_PUBLIC_API_URL sets the API base URL", () => {
  process.env.EXPO_PUBLIC_API_URL = "https://qvitto-api-staging.onrender.com";

  const { default: api } = loadApi();

  expect(api.defaults.baseURL).toBe("https://qvitto-api-staging.onrender.com");
});

test("AC5: without EXPO_PUBLIC_API_URL it falls back to the local backend", () => {
  const { default: api } = loadApi();

  expect(api.defaults.baseURL).toMatch(/^http:\/\/[^/]+:4000$/);
});

describe("AC8: app config", () => {
  const appJson = require("../app.json");
  const appConfig = require("../app.config.js");

  afterEach(() => {
    delete process.env.EXPO_BASE_URL;
  });

  test("AC8: app.json names the app Qvitto with the EAS project's slug", () => {
    expect(appJson.name).toBe("Qvitto");
    expect(appJson.slug).toBe("qvitto-app");
  });

  test("AC8: EXPO_BASE_URL sets the web base path, and nothing changes without it", () => {
    expect(appConfig({ config: appJson })).toEqual(appJson);

    process.env.EXPO_BASE_URL = "/qvitto-platform";

    expect(appConfig({ config: appJson }).experiments.baseUrl).toBe("/qvitto-platform");
  });
});
