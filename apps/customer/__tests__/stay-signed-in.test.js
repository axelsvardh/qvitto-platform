// Spec 003: Stay signed in. One test per acceptance criterion.
import React from "react";
import { Slot, router } from "expo-router";
import { renderRouter, screen, act, fireEvent, waitFor } from "expo-router/testing-library";
import { AxiosError } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api/api";
import { AuthProvider } from "../context/AuthContext";
import Index from "../app/index";
import Login from "../app/login";
import TabsLayout from "../app/(tabs)/_layout";
import Receipts from "../app/(tabs)/receipts";
import Konto from "../app/(tabs)/konto";

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);
jest.mock("../app/hooks/usePushToken", () => () => null);

// Every request goes through the real axios instance and its interceptors;
// only the network layer is replaced. `respond(config)` returns the data for
// a 200, or throws to fail the request.
let respond;
api.defaults.adapter = async (config) => {
  const data = await respond(config);
  return { data, status: 200, statusText: "OK", headers: {}, config };
};
const httpError = (status) => (config) => {
  throw new AxiosError("Request failed", "ERR_BAD_REQUEST", config, null, {
    status,
    data: {},
    headers: {},
    config,
  });
};
const networkError = (config) => {
  throw new AxiosError("Network Error", "ERR_NETWORK", config);
};

let loginRenders;

function renderApp(initialUrl = "/") {
  return renderRouter(
    {
      _layout: () => (
        <AuthProvider>
          <Slot />
        </AuthProvider>
      ),
      index: Index,
      login: () => {
        loginRenders += 1;
        return <Login />;
      },
      guide: () => null,
      "(tabs)/_layout": TabsLayout,
      "(tabs)/receipts": Receipts,
      "(tabs)/sok": () => null,
      "(tabs)/oversikt": () => null,
      "(tabs)/konto": Konto,
    },
    { initialUrl }
  );
}

const LOGIN_HEADLINE = "Inga fler\npapper";

beforeEach(async () => {
  await AsyncStorage.clear();
  respond = async () => [];
  loginRenders = 0;
  jest.restoreAllMocks();
});

test("AC1: a saved, accepted token opens Kvitton without ever showing Login", async () => {
  await AsyncStorage.setItem("token", "valid-token");

  renderApp("/");

  await waitFor(() => expect(screen).toHavePathname("/receipts"));
  expect(await screen.findByText("Ditt nästa köp hamnar här")).toBeTruthy();
  expect(loginRenders).toBe(0);
  expect(screen.queryByText(LOGIN_HEADLINE)).toBeNull();
});

test("AC2: no saved token opens Login", async () => {
  renderApp("/");

  await waitFor(() => expect(screen).toHavePathname("/login"));
  expect(screen.getByText(LOGIN_HEADLINE)).toBeTruthy();
});

test("AC3: a rejected token (401) is removed and Login shows the logged-out line", async () => {
  await AsyncStorage.setItem("token", "expired-token");
  respond = httpError(401);

  renderApp("/");

  expect(await screen.findByText("Du har loggats ut. Logga in igen.")).toBeTruthy();
  expect(screen).toHavePathname("/login");
  expect(screen).toHaveSearchParams({ reason: "expired" });
  expect(await AsyncStorage.getItem("token")).toBeNull();
});

test("AC3: a 403 on any request also logs out", async () => {
  await AsyncStorage.setItem("token", "old-token");
  respond = httpError(403);

  renderApp("/");

  expect(await screen.findByText("Du har loggats ut. Logga in igen.")).toBeTruthy();
  expect(await AsyncStorage.getItem("token")).toBeNull();
});

test("AC3: several requests failing at once only log out once", async () => {
  await AsyncStorage.setItem("token", "expired-token");
  respond = async () => [];
  renderApp("/");
  await waitFor(() => expect(screen).toHavePathname("/receipts"));

  const replace = jest.spyOn(router, "replace");
  respond = httpError(401);
  await act(async () => {
    await Promise.allSettled([
      api.get("/api/transactions"),
      api.get("/api/transactions"),
      api.get("/api/transactions"),
    ]);
  });

  await waitFor(() => expect(screen).toHavePathname("/login"));
  expect(replace).toHaveBeenCalledTimes(1);
  expect(replace).toHaveBeenCalledWith("/login?reason=expired");
});

test("AC3: a wrong password (401 from /api/login) is not treated as an expired session", async () => {
  respond = httpError(401);
  renderApp("/login");
  await waitFor(() => expect(screen).toHavePathname("/login"));

  fireEvent.changeText(screen.getByPlaceholderText("elin.sandberg@mail.se"), "elin@mail.se");
  fireEvent.changeText(screen.getByPlaceholderText("••••••••••"), "wrong");
  fireEvent.press(screen.getAllByText("LOGGA IN")[1]);

  expect(await screen.findByText("Fel e-post eller lösenord.")).toBeTruthy();
  expect(screen.queryByText("Du har loggats ut. Logga in igen.")).toBeNull();
  expect(screen).toHaveSearchParams({});
});

test("AC4: no internet with a saved token opens Kvitton with the error line, still signed in", async () => {
  await AsyncStorage.setItem("token", "valid-token");
  respond = networkError;

  renderApp("/");

  expect(await screen.findByText("Kunde inte hämta dina kvitton.")).toBeTruthy();
  expect(screen).toHavePathname("/receipts");
  expect(loginRenders).toBe(0);
  expect(await AsyncStorage.getItem("token")).toBe("valid-token");
});

test("AC5: a signed-in customer opening /login is redirected to Kvitton", async () => {
  await AsyncStorage.setItem("token", "valid-token");

  renderApp("/login");

  await waitFor(() => expect(screen).toHavePathname("/receipts"));
  expect(screen.queryByText(LOGIN_HEADLINE)).toBeNull();
});

test("AC6: Logga ut removes the token and the next cold start opens Login", async () => {
  await AsyncStorage.setItem("token", "valid-token");
  const app = renderApp("/konto");
  await waitFor(() => expect(screen).toHavePathname("/konto"));

  fireEvent.press(await screen.findByText("Logga ut"));

  await waitFor(() => expect(screen).toHavePathname("/login"));
  expect(await AsyncStorage.getItem("token")).toBeNull();

  // Cold start: a fresh app tree reading the same storage.
  app.unmount();
  renderApp("/");
  await waitFor(() => expect(screen).toHavePathname("/login"));
});

test("AC7: while the saved token is being read, a plain bone screen is shown", async () => {
  let finishRead;
  jest
    .spyOn(AsyncStorage, "getItem")
    .mockImplementationOnce(() => new Promise((resolve) => (finishRead = resolve)));

  renderApp("/");

  expect(screen.getByTestId("startup-placeholder")).toBeTruthy();
  expect(screen).toHavePathname("/");
  expect(loginRenders).toBe(0);

  await act(async () => finishRead("valid-token"));
  await waitFor(() => expect(screen).toHavePathname("/receipts"));
  expect(loginRenders).toBe(0);
});
