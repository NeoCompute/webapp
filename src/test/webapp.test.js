const request = require("supertest");
const app = require("../app");
const { dbConnection } = require("../databases/postgresDbConnection");
const bcrypt = require("bcrypt");
const User = require("../models/user");

let appServer;
let userId;
let token;
let basicAuthHeader;

beforeAll(async () => {
  appServer = app.listen();

  // Create a user for testing
  const passwordHash = await bcrypt.hash("Password123!", 10);

  const user = await User.create({
    email: "testuser@gmail.com",
    password: passwordHash,
    firstName: "Test",
    lastName: "User",
    token: "valid_token",
    token_expiry: new Date(new Date().getTime() + 60 * 60 * 1000), // Token expires in 1 hour
  });

  token = user.token;
  userId = user.id;

  // Basic auth header for testing
  const credentials = Buffer.from("testuser@gmail.com:Password123!").toString(
    "base64"
  );
  basicAuthHeader = `Basic ${credentials}`;
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
  it("should create a new user successfully", async () => {
    const res = await request(app).post("/v1/user").send({
      email: "newuser@gmail.com",
      password: "NewPassword@123",
      firstName: "New",
      lastName: "User",
    });

    expect(res.statusCode).toEqual(201);
  });

  it("should return 400 when creating a user with an existing email", async () => {
    const res = await request(app).post("/v1/user").send({
      email: "testuser@gmail.com",
      password: "Password123!",
      firstName: "Test",
      lastName: "User",
    });

    expect(res.statusCode).toEqual(400);
  });

  // Password validation tests
  it("should return 400 for a password that is too short", async () => {
    const res = await request(app).post("/v1/user").send({
      email: "invalidpassworduser@gmail.com",
      password: "short",
      firstName: "Short",
      lastName: "Password",
    });

    expect(res.statusCode).toEqual(400);
  });

  it("should return 400 for a password without an uppercase letter", async () => {
    const res = await request(app).post("/v1/user").send({
      email: "invalidpassworduser@gmail.com",
      password: "password123!",
      firstName: "Short",
      lastName: "Password",
    });

    expect(res.statusCode).toEqual(400);
  });

  it("should return 400 for a password without a special character", async () => {
    const res = await request(app).post("/v1/user").send({
      email: "invalidpassworduser@gmail.com",
      password: "Password123",
      firstName: "Short",
      lastName: "Password",
    });

    expect(res.statusCode).toEqual(400);
  });

  it("should return 400 for a password without a number", async () => {
    const res = await request(app).post("/v1/user").send({
      email: "invalidpassworduser@gmail.com",
      password: "Password!",
      firstName: "Short",
      lastName: "Password",
    });

    expect(res.statusCode).toEqual(400);
  });

  it("should return 400 for an invalid email format", async () => {
    const res = await request(app).post("/v1/user").send({
      email: "invalidemail.com",
      password: "Password123!",
      firstName: "Short",
      lastName: "Password",
    });

    expect(res.statusCode).toEqual(400);
  });

  it("should return 400 for missing fields", async () => {
    const res = await request(app).post("/v1/user").send({
      email: "newuser@gmail.com",
      firstName: "New",
      lastName: "User",
    });

    expect(res.statusCode).toEqual(400);
  });

  it("should return 400 Bad Request when 'account_created' is included in the request body", async () => {
    const res = await request(app).post("/v1/user").send({
      firstName: "New",
      lastName: "User",
      email: "newuser@example.com",
      password: "password",
      account_created: "2023-01-01T00:00:00Z",
    });

    expect(res.statusCode).toEqual(400);
  });

  it("should return 400 Bad Request when 'account_updated' is included in the request body", async () => {
    const res = await request(app).post("/v1/user").send({
      firstName: "New",
      lastName: "User",
      email: "newuser@example.com",
      password: "password",
      account_updated: "2023-01-01T00:00:00Z",
    });

    expect(res.statusCode).toEqual(400);
  });
});

// Get user information
describe("Test 10 | Get user information", () => {
  it("should return user information with Bearer token", async () => {
    const res = await request(app)
      .get("/v1/user/self")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
  });

  it("should return user information with Basic auth", async () => {
    const res = await request(app)
      .get("/v1/user/self")
      .set("Authorization", basicAuthHeader);
    expect(res.statusCode).toEqual(200);
  });

  it("should return 401 if no authorization header is provided", async () => {
    const res = await request(app).get("/v1/user/self");
    expect(res.statusCode).toEqual(401);
  });

  it("should return 401 for invalid Bearer token", async () => {
    const res = await request(app)
      .get("/v1/user/self")
      .set("Authorization", "Bearer invalid_token");
    expect(res.statusCode).toEqual(401);
  });

  it("should return 401 for invalid Basic credentials", async () => {
    const invalidAuthHeader = `Basic ${Buffer.from(
      "wronguser@gmail.com:WrongPassword"
    ).toString("base64")}`;
    const res = await request(app)
      .get("/v1/user/self")
      .set("Authorization", invalidAuthHeader);
    expect(res.statusCode).toEqual(401);
  });
});

// Update user information
describe("Test 11 | Update user information", () => {
  it("should update user information successfully with Bearer token", async () => {
    const res = await request(app)
      .put("/v1/user/self")
      .set("Authorization", `Bearer ${token}`)
      .send({
        firstName: "Updated",
        lastName: "User",
      });

    expect(res.statusCode).toEqual(200);
  });

  // Password validation tests for update
  it("should return 400 for a password that is too short during update", async () => {
    const res = await request(app)
      .put("/v1/user/self")
      .set("Authorization", `Bearer ${token}`)
      .send({
        password: "short",
      });

    expect(res.statusCode).toEqual(400);
  });

  it("should return 400 for a password without an uppercase letter during update", async () => {
    const res = await request(app)
      .put("/v1/user/self")
      .set("Authorization", `Bearer ${token}`)
      .send({
        password: "password123!",
      });

    expect(res.statusCode).toEqual(400);
  });

  it("should return 400 for a password without a special character during update", async () => {
    const res = await request(app)
      .put("/v1/user/self")
      .set("Authorization", `Bearer ${token}`)
      .send({
        password: "Password123",
      });

    expect(res.statusCode).toEqual(400);
  });

  it("should return 400 for a password without a number during update", async () => {
    const res = await request(app)
      .put("/v1/user/self")
      .set("Authorization", `Bearer ${token}`)
      .send({
        password: "Password!",
      });

    expect(res.statusCode).toEqual(400);
  });

  it("should return 400 when trying to update restricted fields", async () => {
    const res = await request(app)
      .put("/v1/user/self")
      .set("Authorization", `Bearer ${token}`)
      .send({
        email: "newemail@gmail.com",
      });

    expect(res.statusCode).toEqual(400);
  });

  it("should return 401 if no authorization header is provided", async () => {
    const res = await request(app).put("/v1/user/self").send({
      firstName: "Updated",
      lastName: "User",
    });

    expect(res.statusCode).toEqual(401);
  });

  it("should return 400 Bad Request when trying to update 'account_created'", async () => {
    const res = await request(app)
      .put("/v1/user/self")
      .set("Authorization", `Bearer ${token}`)
      .send({
        account_created: "2023-01-01T00:00:00Z",
        firstName: "Updated",
      });

    expect(res.statusCode).toEqual(400);
  });

  it("should return 400 Bad Request when trying to update 'account_updated'", async () => {
    const res = await request(app)
      .put("/v1/user/self")
      .set("Authorization", `Bearer ${token}`)
      .send({
        account_updated: "2023-01-01T00:00:00Z",
        lastName: "Updated",
      });

    expect(res.statusCode).toEqual(400);
  });
});

// Unauthorized Access and Method Not Allowed
describe("Test 12 | Unauthorized Access and Method Not Allowed", () => {
  it("should return 405 Method Not Allowed for DELETE request", async () => {
    const res = await request(app).delete("/v1/user/self");
    expect(res.statusCode).toEqual(405);
  });

  it("should return 405 Method Not Allowed for PATCH request", async () => {
    const res = await request(app).patch("/v1/user/self");
    expect(res.statusCode).toEqual(405);
  });

  it("should return 405 Method Not Allowed for HEAD request", async () => {
    const res = await request(app).head("/v1/user/self");
    expect(res.statusCode).toEqual(405);
  });

  it("should return 405 Method Not Allowed for OPTIONS request", async () => {
    const res = await request(app).options("/v1/user/self");
    expect(res.statusCode).toEqual(405);
  });
});
 