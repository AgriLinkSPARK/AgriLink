import request from "supertest";
import app from "../../server.js";
import { connectDB, disconnectDB, clearDB } from "../setup.js";
import User from "../../models/User.js";
import authService from "../../services/authService.js";

describe("Message Integration Tests", () => {
  let customer;
  let farmer;
  let customerToken;
  let farmerToken;

  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    await clearDB();

    customer = await User.create({
      name: "Customer One",
      email: "customer.one@test.com",
      password: "password123",
      role: "customer",
    });

    farmer = await User.create({
      name: "Farmer One",
      email: "farmer.one@test.com",
      password: "password123",
      role: "farmer",
    });

    customerToken = authService.generateToken(customer);
    farmerToken = authService.generateToken(farmer);
  });

  test("POST /api/messages should send customer -> farmer message", async () => {
    const res = await request(app)
      .post("/api/messages")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        receiverId: farmer._id,
        messageText: "Hi farmer, do you have fresh tomatoes?",
      });

    expect(res.status).toBe(201);
    expect(res.body.receiverId).toBe(String(farmer._id));
    expect(res.body.senderId).toBe(String(customer._id));
  });

  test("GET /api/messages/inbox should return sent message for farmer", async () => {
    await request(app)
      .post("/api/messages")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ receiverId: farmer._id, messageText: "Farmer inbox test" });

    const res = await request(app)
      .get("/api/messages/inbox")
      .set("Authorization", `Bearer ${farmerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].messageText).toBe("Farmer inbox test");
  });

  test("GET /api/messages/inbox should return sent message for customer", async () => {
    await request(app)
      .post("/api/messages")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ receiverId: farmer._id, messageText: "Customer inbox test" });

    const res = await request(app)
      .get("/api/messages/inbox")
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].messageText).toBe("Customer inbox test");
  });
});
