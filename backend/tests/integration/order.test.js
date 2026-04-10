// backend/tests/integration/order.test.js
import request from "supertest";
import app from "../../server.js";
import { connectDB, disconnectDB, clearDB } from "../setup.js";
import User from "../../models/User.js";
import Product from "../../models/Product.js";
import Store from "../../models/Store.js";
import Cart from "../../models/Cart.js";
import authService from "../../services/authService.js";

describe("Order Integration Tests", () => {
    let token;
    let productId;

    beforeAll(async () => {
        await connectDB();
        
        const user = await User.create({
            name: "Order Buyer",
            email: "order-buyer@test.com",
            password: "password123",
            role: "customer"
        });
        token = authService.generateToken(user);

        const farmer = await User.create({
            name: "Order Farmer",
            email: "order-farmer@test.com",
            password: "password123",
            role: "farmer"
        });
        
        const store = await Store.create({
            farmer: farmer._id,
            name: "Order Store"
        });

        const product = await Product.create({
            store: store._id,
            name: "Order Carrot",
            category: "Vegetables",
            price: 30,
            quantity: 200,
            unit: "kg",
            mainImage: "http://example.com/carrot.jpg"
        });
        productId = product._id;

        // Manually add item to cart for checkout test
        await Cart.create({
            buyerId: user._id,
            items: [{ productId: productId, name: "Order Carrot", price: 30, quantity: 10 }]
        });
    });

    afterAll(async () => {
        await disconnectDB();
    });

    test("POST /api/orders/checkout should create an order and clear the cart", async () => {
        const res = await request(app)
            .post("/api/orders/checkout")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.totalPrice).toBe(300); // 10 * 30
        
        // Verify cart is cleared
        const cart = await Cart.findOne({ buyerId: res.body.data.buyerId });
        expect(cart.items).toHaveLength(0);
    });

    test("GET /api/orders/my-orders should retrieve the orders", async () => {
        const res = await request(app)
            .get("/api/orders/my-orders")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(1);
    });
});
