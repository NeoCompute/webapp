const request = require("supertest");
const app = require("../app");
const { dbConnection } = require("../databases/postgresDbConnection");
const bcrypt = require("bcrypt");
const User = require("../models/user"); // Assuming this is where the User model is stored

let appServer;
let userId;
let token;

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

// Assignment 2

describe("Test 9 | Create a new user", () => {
  it("should create a new user successfully", async () => {
    const res = await request(app).post("/v1/user").send({
      email: "anush@gmail.com",
      password: "Anusha@123",
      firstName: "Anusha",
      lastName: "Kumbar",
    });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("email", "anush@gmail.com");
    expect(res.body).toHaveProperty("firstName", "Anusha");
    expect(res.body).toHaveProperty("lastName", "Kumbar");
    expect(res.body).toHaveProperty("token");
    expect(res.body).not.toHaveProperty("password");
    expect(res.body).not.toHaveProperty("account_created");
    expect(res.body).not.toHaveProperty("account_updated");
    expect(res.body).not.toHaveProperty("token_expiry");

    // Store userId and token for further tests
    userId = res.body.id;
    token = res.body.token;

    // Verify password is hashed in the database
    const user = await User.findByPk(userId);
    expect(user).not.toBeNull();
    const isPasswordHashed = await bcrypt.compare("Anusha@123", user.password);
    expect(isPasswordHashed).toBe(true);
  });

  it("should return 400 when creating a user with existing email", async () => {
    const res = await request(app).post("/v1/user").send({
      email: "anush@gmail.com",
      password: "AnotherPass@456",
      firstName: "Anush",
      lastName: "Kumar",
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty(
      "message",
      "A user with this email already exists."
    );
  });

  it("should ignore account_created and account_updated fields if provided", async () => {
    const res = await request(app).post("/v1/user").send({
      email: "newuser@gmail.com",
      password: "NewUser@123",
      firstName: "New",
      lastName: "User",
      account_created: "2025-01-01T00:00:00Z",
      account_updated: "2025-01-01T00:00:00Z",
    });

    console.log("Response Body: ", res.body);

    // Expectation for status code
    expect(res.statusCode).toEqual(201); // Test is failing here, so we need to know why it's 400

    // Ensure response contains the necessary properties
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("email");
    expect(res.body).toHaveProperty("firstName");
    expect(res.body).toHaveProperty("lastName");
    expect(res.body).toHaveProperty("token");
    expect(res.body).not.toHaveProperty("password");
    expect(res.body).not.toHaveProperty("account_created");
    expect(res.body).not.toHaveProperty("account_updated");
    expect(res.body).not.toHaveProperty("token_expiry");

    await new Promise((resolve) => setTimeout(resolve, 100));

    // Verify that account_created and account_updated are set to current time
    const user = await User.findByPk(res.body.id);
    console.log("Created user in DB: ", user);

    expect(user.account_created).not.toEqual(new Date("2025-01-01T00:00:00Z"));
    expect(user.account_updated).not.toEqual(new Date("2025-01-01T00:00:00Z"));
  });

  it("should return 400 when required fields are missing", async () => {
    const res = await request(app).post("/v1/user").send({
      password: "Anusha@123",
      firstName: "Anusha",
      lastName: "Kumbar",
    });

    expect(res.statusCode).toEqual(400);
    // expect(res.body).toHaveProperty("message");
    // expect(res.body.message).toMatch(/A valid email is required/);
  });

  // it("should return 400 when email format is invalid", async () => {
  //   const res = await request(app).post("/v1/user").send({
  //     email: "invalid-email-format",
  //     password: "Anusha@123",
  //     firstName: "Anusha",
  //     lastName: "Kumbar",
  //   });

  //   expect(res.statusCode).toEqual(400);
  //   expect(res.body).toHaveProperty("message");
  //   expect(res.body.message).toMatch(/A valid email is required/);
  // });
});

// Get user information tests
describe("Test 10 | Get user information", () => {
  it("should return user information successfully", async () => {
    const res = await request(app)
      .get("/v1/user/self")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("email", "anush@gmail.com");
    expect(res.body).toHaveProperty("firstName", "Anusha");
    expect(res.body).toHaveProperty("lastName", "Kumbar");
    expect(res.body).not.toHaveProperty("password");
    expect(res.body).not.toHaveProperty("token");
    expect(res.body).not.toHaveProperty("token_expiry");
  });

  it("should return 401 if no token is provided", async () => {
    const res = await request(app).get("/v1/user/self");

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty("message", "Authorization header missing");
  });

  it("should return 401 if an invalid token is provided", async () => {
    const res = await request(app)
      .get("/v1/user/self")
      .set("Authorization", "Bearer invalid_token");

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty("message", "Invalid or expired token");
  });
});

// Update user information tests
describe("Test 11 | Update user information", () => {
  it("should update user information successfully", async () => {
    const res = await request(app)
      .put("/v1/user/self")
      .set("Authorization", `Bearer ${token}`)
      .send({
        firstName: "Anu",
        lastName: "K",
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("firstName", "Anu");
    expect(res.body).toHaveProperty("lastName", "K");
    expect(res.body).not.toHaveProperty("password");
    expect(res.body).not.toHaveProperty("token");
    expect(res.body).not.toHaveProperty("token_expiry");

    // Verify that the account_updated field was updated
    const user = await User.findByPk(userId);
    expect(new Date(user.account_updated).getTime()).toBeGreaterThan(
      new Date(user.account_created).getTime()
    );
  });

  it("should return 400 when attempting to update fields other than firstName, lastName, or password", async () => {
    const res = await request(app)
      .put("/v1/user/self")
      .set("Authorization", `Bearer ${token}`)
      .send({
        email: "newemail@gmail.com",
      });

    expect(res.statusCode).toEqual(400);
  });

  it("should return 401 if no token is provided", async () => {
    const res = await request(app).put("/v1/user/self").send({
      firstName: "Anu",
      lastName: "K",
    });

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty("message", "Authorization header missing");
  });

  it("should return 401 if an invalid token is provided", async () => {
    const res = await request(app)
      .put("/v1/user/self")
      .set("Authorization", "Bearer invalid_token")
      .send({
        firstName: "Anu",
        lastName: "K",
      });

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty("message", "Invalid or expired token");
  });
});
