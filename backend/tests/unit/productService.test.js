// backend/tests/unit/productService.test.js
import { jest } from "@jest/globals";
import Product from "../../models/Product.js";

// Mock the Product model
jest.spyOn(Product, "find").mockImplementation(() => ({
    populate: () => ({
        skip: () => ({
            limit: () => ({
                sort: async () => [{ name: "Test Product", category: "Vegetables" }]
            })
        })
    })
}));

jest.spyOn(Product, "countDocuments").mockImplementation(async () => 1);

// Import the service after mocking
import productService from "../../services/productService.js";

describe("ProductService Unit Tests", () => {
    test("getAllProducts should return paginated results", async () => {
        const result = await productService.getAllProducts({ page: 1, limit: 10 });
        
        expect(result.products).toHaveLength(1);
        expect(result.total).toBe(1);
        expect(result.page).toBe(1);
        expect(result.pages).toBe(1);
    });

    test("getAllProducts should handle category filters", async () => {
        // Just verify it calls find with the right filter
        await productService.getAllProducts({ category: "Vegetables" });
        expect(Product.find).toHaveBeenCalledWith(expect.objectContaining({ category: "Vegetables" }));
    });
});
