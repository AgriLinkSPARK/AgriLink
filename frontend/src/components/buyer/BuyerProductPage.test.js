import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import BuyerProductPage from "./BuyerProductPage";

describe("BuyerProductPage", () => {
  const product = {
    _id: "p1",
    name: "Fresh Tomato",
    category: "Vegetables",
    description: "Red organic tomatoes",
    price: 150,
    quantity: 20,
    unit: "kg",
    store: { name: "Green Store" },
    mainImage: "https://example.com/main.jpg",
    extraImages: ["https://example.com/extra1.jpg", "https://example.com/extra2.jpg"],
  };

  const reviews = [
    {
      _id: "r1",
      buyerId: { name: "Alice" },
      rating: 5,
      comment: "Great product",
      createdAt: "2026-01-01T00:00:00.000Z",
    },
  ];

  test("renders main image and extra images", () => {
    render(
      <BuyerProductPage
        product={product}
        reviews={reviews}
        loading={false}
        error=""
        onBack={() => {}}
        onAddToCart={async () => {}}
      />
    );

    expect(screen.getAllByText(/Fresh Tomato/i).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("img").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText(/Product Reviews/i)).toBeInTheDocument();
    expect(screen.getByText(/Great product/i)).toBeInTheDocument();
  });

  test("invokes add to cart", async () => {
    const onAddToCart = jest.fn().mockResolvedValue(undefined);

    render(
      <BuyerProductPage
        product={product}
        reviews={reviews}
        loading={false}
        error=""
        onBack={() => {}}
        onAddToCart={onAddToCart}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Add to cart/i }));
    await waitFor(() => {
      expect(onAddToCart).toHaveBeenCalledWith("p1");
    });
  });
});
