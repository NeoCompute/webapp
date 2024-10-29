const request = require("supertest");
const app = require("../app");
const bcrypt = require("bcrypt");
const { User } = require("../models/user"); // CommonJS-style require

jest.mock("../models/user", () => ({
  User: {
    create: jest.fn(),
    findOne: jest.fn(),
  },
}));

let appServer;
let basicAuthHeader;

beforeAll(async () => {
  appServer = app.listen();

  const passwordHash = await bcrypt.hash("Password123!", 10);

  // Mock User.create
  User.create.mockResolvedValue({
    id: 1,
    email: "testuser@gmail.com",
    password: passwordHash,
    first_name: "Test",
    last_name: "User",
  });

  const credentials = Buffer.from("testuser@gmail.com:Password123!").toString(
    "base64"
  );
  basicAuthHeader = `Basic ${credentials}`;
});

afterAll(async () => {
  if (appServer) {
    appServer.close();
  }
});

/* Assignment 1 */

// Test for successful health check
// describe("Test 1 | HealthCheck Success", () => {
//   it("Expect 200 for success", async () => {
//     const res = await request(app).get("/healthz");
//     expect(res.statusCode).toEqual(200);
//   });
// });

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
    const res = await request(app).get("/healthz").send({ key: "value" });
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

/* Assignment 2 */

// Create a new user
describe("Test 9 | Create a new user", () => {
  it("should return 400 Bad Request when 'account_created' is included in the request body", async () => {
    const res = await request(app).post("/v1/user").send({
      first_name: "New",
      last_name: "User",
      email: "newuser@example.com",
      password: "password",
      account_created: "2023-01-01T00:00:00Z",
    });

    expect(res.statusCode).toEqual(400);
  });

  it("should return 400 Bad Request when 'account_updated' is included in the request body", async () => {
    const res = await request(app).post("/v1/user").send({
      first_name: "New",
      last_name: "User",
      email: "newuser@example.com",
      password: "password",
      account_updated: "2023-01-01T00:00:00Z",
    });

    expect(res.statusCode).toEqual(400);
  });
});

// Get user information
describe("Test 10 | Get user information", () => {
  it("should return 401 if no authorization header is provided", async () => {
    const res = await request(app).get("/v1/user/self");
    expect(res.statusCode).toEqual(401);
  });
});

// Unauthorized Access and Method Not Allowed
// describe("Test 12 | Unauthorized Access and Method Not Allowed", () => {
//   it("should return 405 Method Not Allowed for DELETE request", async () => {
//     const res = await request(app).delete("/v1/user/self");
//     expect(res.statusCode).toEqual(405);
//   });

//   it("should return 405 Method Not Allowed for PATCH request", async () => {
//     const res = await request(app).patch("/v1/user/self");
//     expect(res.statusCode).toEqual(405);
//   });

//   it("should return 405 Method Not Allowed for HEAD request", async () => {
//     const res = await request(app).head("/v1/user/self");
//     expect(res.statusCode).toEqual(405);
//   });

//   it("should return 405 Method Not Allowed for OPTIONS request", async () => {
//     const res = await request(app).options("/v1/user/self");
//     expect(res.statusCode).toEqual(405);
//   });
// });
