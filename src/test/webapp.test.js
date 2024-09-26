const request = require("supertest");
const app = require("../app");
const { dbConnection } = require("../databases/postgresDbConnection");

let appServer;

beforeAll(() => {
  appServer = app.listen();
});

afterAll(async () => {
  await dbConnection.close();
  appServer.close();
});

/* Assignment 1 */

// Test for successful health check
describe("Test 1 | HealthCheck Success", () => {
  it("Expect 200 for success", async () => {
    const res = await request(app).get("/healthz");
    expect(res.statusCode).toEqual(200);
  });
});

// Test for unsuccessful health check (mocking database connection failure)
describe("Test 2 | HealthCheck Database Unavailable", () => {
  beforeAll(() => {
    // Mock the database connection to simulate failure
    jest.spyOn(dbConnection, "authenticate").mockImplementationOnce(() => {
      throw new Error("Database connection failed");
    });
  });

  it("Expect 503 Service Unavailable", async () => {
    const res = await request(app).get("/healthz");
    expect(res.statusCode).toEqual(503);
  });
});

// Test for invalid method
describe("Test 3 | HealthCheck Invalid Method", () => {
  it("Expect 405 for invalid method", async () => {
    const res = await request(app).post("/healthz");
    expect(res.statusCode).toEqual(405);
  });
});

// Test for invalid query parameters
describe("Test 4 | HealthCheck Invalid Query Param", () => {
  it("Expect 400 for invalid query param", async () => {
    const res = await request(app).get("/healthz").query({ key: "value" });
    expect(res.statusCode).toEqual(400);
  });
});

// Test for payload in request
describe("Test 5 | HealthCheck Payload", () => {
  it("Expect 400 for payload in request", async () => {
    const res = await request(app).get("/healthz").send({ key: "value" }); // Sending a payload
    expect(res.statusCode).toEqual(400);
  });
});

// Test for cache-control header
describe("Test 6 | HealthCheck Cache-Control Header", () => {
  it("Should not cache response", async () => {
    const res = await request(app).get("/healthz");
    expect(res.headers["cache-control"]).toBe(
      "no-cache, no-store, must-revalidate"
    );
  });
});

// Test for no payload in response
describe("Test 7 | HealthCheck No Payload in Response", () => {
  it("Expect no payload in response", async () => {
    const res = await request(app).get("/healthz");
    expect(res.body).toEqual({}); // Ensure response body is empty
  });
});

// Test for undefined routes
describe("Test 8 | HealthCheck Undefined Route", () => {
  it("Expect 404 for undefined route", async () => {
    const res = await request(app).get("/undefined-route");
    expect(res.statusCode).toEqual(404);
  });
});
