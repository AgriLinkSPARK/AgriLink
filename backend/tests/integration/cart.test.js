// backend/tests/integration/cart.test.js
import request from "supertest";
import app from "../../server.js";
import { connectDB, disconnectDB, clearDB } from "../setup.js";
import User from "../../models/User.js";
import Product from "../../models/Product.js";
import Store from "../../models/Store.js";
import authService from "../../services/authService.js";

describe("Cart Integration Tests", () => {
    let token;
    let buyerId;
    let productId;

    beforeAll(async () => {
        await connectDB();
        
        // Create a buyer
        const user = await User.create({
            name: "Test Buyer",
            email: "buyer@test.com",
            password: "password123",
            role: "customer"
        });
        buyerId = user._id;
        token = authService.generateToken(user);

        // Create a farmer and a store
        const farmer = await User.create({
            name: "Test Farmer",
            email: "farmer@test.com",
            password: "password123",
            role: "farmer"
        });
        
        const store = await Store.create({
            farmer: farmer._id,
            name: "Test Store",
            description: "A test store"
        });

        // Create a product
        const product = await Product.create({
            store: store._id,
            name: "Test Tomato",
            category: "Vegetables",
            price: 50,
            quantity: 100,
            unit: "kg",
            mainImage: "http://example.com/image.jpg"
        });
        productId = product._id;
    });

    afterAll(async () => {
        await disconnectDB();
    });

    beforeEach(async () => {
        // We don't clearDB because we need the user and product for all tests
    });

    test("POST /api/cart/add should add an item to the cart", async () => {
        const res = await request(app)
            .post("/api/cart/add")
            .set("Authorization", `Bearer ${token}`)
            .send({
                productId: productId,
                quantity: 2
            });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });

    test("GET /api/cart should retrieve the user's cart", async () => {
        const res = await request(app)
            .get("/api/cart")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.data.items).toHaveLength(1);
        expect(res.body.data.items[0].productId._id).toBe(productId.toString());
    });

    test("PUT /api/cart/update/:productId should update the quantity", async () => {
        const res = await request(app)
            .put(`/api/cart/update/${productId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                quantity: 5
            });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });
});
