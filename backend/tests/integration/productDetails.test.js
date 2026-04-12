import request from "supertest";
import app from "../../server.js";
import { connectDB, disconnectDB, clearDB } from "../setup.js";
import User from "../../models/User.js";
import Store from "../../models/Store.js";
import Product from "../../models/Product.js";
import Review from "../../models/Review.js";
import authService from "../../services/authService.js";

describe("Product Details and Review Integration Tests", () => {
  let customer;
  let customerToken;
  let product;

  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    await clearDB();

    customer = await User.create({
      name: "Buyer Test",
      email: "buyer.details@test.com",
      password: "password123",
      role: "customer",
    });

    const farmer = await User.create({
      name: "Farmer Details",
      email: "farmer.details@test.com",
      password: "password123",
      role: "farmer",
    });

    const store = await Store.create({
      farmer: farmer._id,
      name: "Details Store",
      description: "Testing product details",
      location: "Kandy",
    });

    product = await Product.create({
      store: store._id,
      name: "Fresh Beans",
      category: "Vegetables",
      description: "Crispy and fresh beans",
      price: 120,
      quantity: 40,
      unit: "kg",
      mainImage: "https://example.com/main.jpg",
      extraImages: ["https://example.com/extra1.jpg"],
    });

    await Review.create({
      productId: product._id,
      buyerId: customer._id,
      rating: 5,
      comment: "Excellent quality",
    });

    customerToken = authService.generateToken(customer);
  });

  test("GET /api/products/details/:id should return a product for customer", async () => {
    const res = await request(app)
      .get(`/api/products/details/${product._id}`)
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe("Fresh Beans");
    expect(res.body.data.store).toBeDefined();
  });

  test("GET /api/reviews?productId=... should return only product reviews", async () => {
    const res = await request(app)
      .get(`/api/reviews?productId=${product._id}`)
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0].comment).toBe("Excellent quality");
  });
});
