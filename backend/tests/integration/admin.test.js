import request from "supertest";
import app from "../../server.js";
import { connectDB, disconnectDB, clearDB } from "../setup.js";
import User from "../../models/User.js";
import authService from "../../services/authService.js";

describe("Admin Integration Tests", () => {
  let admin;
  let adminToken;
  let targetUser;

  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    await clearDB();

    admin = await User.create({
      name: "Main Admin",
      email: "admin@test.com",
      password: "password123",
      role: "admin",
    });

    targetUser = await User.create({
      name: "Target Buyer",
      email: "buyer.target@test.com",
      password: "password123",
      role: "customer",
    });

    adminToken = authService.generateToken(admin);
  });

  test("POST /api/admin/users creates a new farmer user", async () => {
    const res = await request(app)
      .post("/api/admin/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "New Farmer",
        email: "new.farmer@test.com",
        role: "farmer",
      });

    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe("farmer");
    expect(res.body.user.email).toBe("new.farmer@test.com");
  });

  test("GET /api/admin/users?role=customer returns filtered users", async () => {
    const res = await request(app)
      .get("/api/admin/users?role=customer")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.users)).toBe(true);
    expect(res.body.users.every((entry) => entry.role === "customer")).toBe(true);
  });

  test("PUT /api/admin/users/:id updates user profile", async () => {
    const res = await request(app)
      .put(`/api/admin/users/${targetUser._id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Updated Buyer", role: "customer" });

    expect(res.status).toBe(200);
    expect(res.body.user.name).toBe("Updated Buyer");
  });

  test("DELETE /api/admin/users/:id blocks deleting own account", async () => {
    const res = await request(app)
      .delete(`/api/admin/users/${admin._id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Cannot delete your own account");
  });
});
