import mongoose from "mongoose";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";

import app from "../../server.js";
import User from "../../models/User.js";

describe("Auth API Integration Tests", () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  test("POST /api/auth/register/customer creates a customer", async () => {
    const payload = {
      name: "Integration User",
      email: "integration.user@example.com",
      password: "secret123",
    };

    const res = await request(app)
      .post("/api/auth/register/customer")
      .send(payload)
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("token");
    expect(res.body.data.role).toBe("customer");
  });

  test("POST /api/auth/register/customer returns 400 for duplicate email", async () => {
    const payload = {
      name: "Dup User",
      email: "dup.user@example.com",
      password: "secret123",
    };

    await request(app).post("/api/auth/register/customer").send(payload).expect(201);

    const res = await request(app)
      .post("/api/auth/register/customer")
      .send(payload)
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Email already exists");
  });

  test("POST /api/auth/login/customer logs in a registered customer", async () => {
    const payload = {
      name: "Login User",
      email: "login.user@example.com",
      password: "secret123",
    };

    await request(app).post("/api/auth/register/customer").send(payload).expect(201);

    const res = await request(app)
      .post("/api/auth/login/customer")
      .send({ email: payload.email, password: payload.password })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("token");
    expect(res.body.data.role).toBe("customer");
  });

  test("POST /api/auth/login rejects customer on admin/farmer login endpoint", async () => {
    const payload = {
      name: "Wrong Endpoint User",
      email: "wrong.endpoint@example.com",
      password: "secret123",
    };

    await request(app).post("/api/auth/register/customer").send(payload).expect(201);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: payload.email, password: payload.password })
      .expect(403);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Use admin/farmer login endpoint");
  });

  test("GET /api/auth/dashboard returns 401 without token", async () => {
    const res = await request(app)
      .get("/api/auth/dashboard")
      .expect(401);

    expect(res.body.message).toBe("No token");
  });

  test("POST /api/auth/login/customer returns 400 on invalid email format", async () => {
    const res = await request(app)
      .post("/api/auth/login/customer")
      .send({ email: "invalid-email", password: "secret123" })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Invalid email format");
  });
});
