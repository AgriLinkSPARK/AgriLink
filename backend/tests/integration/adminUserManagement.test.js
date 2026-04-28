import request from "supertest";
import app from "../../server.js";
import { connectDB, disconnectDB, clearDB } from "../setup.js";
import User from "../../models/User.js";
import authService from "../../services/authService.js";

describe("Admin User Management Integration Tests", () => {
  let adminToken;
  let customerToken;
  let adminUser;
  let customerUser;

  beforeAll(async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    await clearDB();

    adminUser = await User.create({
      name: "Admin User",
      email: "admin@test.com",
      password: "password123",
      role: "admin",
    });

    customerUser = await User.create({
      name: "Customer User",
      email: "customer@test.com",
      password: "password123",
      role: "customer",
    });

    adminToken = authService.generateToken(adminUser);
    customerToken = authService.generateToken(customerUser);
  });

  test("GET /api/admin/users should return 401 without token", async () => {
    const res = await request(app).get("/api/admin/users");

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("No token");
  });

  test("GET /api/admin/users should return 403 for non-admin token", async () => {
    const res = await request(app)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("Access denied: insufficient permissions");
  });

  test("GET /api/admin/users should return users for admin", async () => {
    const res = await request(app)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Users retrieved successfully");
    expect(res.body.total).toBe(2);
    expect(Array.isArray(res.body.users)).toBe(true);
  });

  test("POST /api/admin/users should create a farmer user", async () => {
    const res = await request(app)
      .post("/api/admin/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "New Farmer",
        email: "new-farmer@test.com",
        role: "farmer",
      });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Farmer created successfully");
    expect(res.body.user.email).toBe("new-farmer@test.com");
    expect(res.body.user.role).toBe("farmer");
    expect(typeof res.body.user.password).toBe("string");
    expect(res.body.user.password.length).toBe(8);

    const createdUser = await User.findOne({ email: "new-farmer@test.com" });
    expect(createdUser).toBeTruthy();
    expect(createdUser.role).toBe("farmer");
    expect(createdUser.password).not.toBe(res.body.user.password);
  });

  test("PUT /api/admin/users/:userId/password should update password", async () => {
    const res = await request(app)
      .put(`/api/admin/users/${customerUser._id}/password`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ password: "newpass123" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Password updated successfully");
    expect(res.body.user.id).toBe(customerUser._id.toString());

    const updatedUser = await User.findById(customerUser._id);
    expect(updatedUser.password).not.toBe("newpass123");
  });

  test("DELETE /api/admin/users/:userId should block self-delete", async () => {
    const res = await request(app)
      .delete(`/api/admin/users/${adminUser._id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Cannot delete your own account");
  });
});
