import { render, screen, fireEvent, within } from "@testing-library/react";
import BuyerDashboard from "./BuyerDashboard";

function createProps() {
  return {
    data: {
      products: [
        {
          _id: "prod1",
          name: "Tomato",
          category: "Vegetables",
          description: "Fresh",
          price: 100,
          unit: "kg",
          quantity: 10,
          mainImage: "https://example.com/tomato.jpg",
          store: { _id: "store1", name: "Farm Store", farmer: { _id: "f1", name: "Farmer" } },
        },
      ],
      cart: { items: [] },
      cartTotal: 0,
      orders: [],
      reviews: [],
      unpaidOrders: 0,
      productPage: 1,
      productPages: 1,
      productFilters: { search: "", category: "all", page: 1 },
    },
    user: { _id: "u1", name: "Buyer", email: "buyer@test.com" },
    loading: false,
    error: "",
    actions: {
      logout: jest.fn(),
      addToCart: jest.fn().mockResolvedValue(undefined),
      updateCart: jest.fn(),
      removeFromCart: jest.fn(),
      checkout: jest.fn(),
      pay: jest.fn(),
      cancel: jest.fn(),
      sendMessage: jest.fn(),
      createReview: jest.fn(),
      updateProfile: jest.fn(),
      setProductFilters: jest.fn(),
      trackDelivery: jest.fn(),
    },
    onViewStore: jest.fn(),
    onViewProduct: jest.fn(),
  };
}

describe("BuyerDashboard product cards", () => {
  test("clicking product card opens product page", () => {
    const props = createProps();
    render(<BuyerDashboard {...props} />);

    fireEvent.click(screen.getByText("Tomato"));
    expect(props.onViewProduct).toHaveBeenCalledWith("prod1");
  });

  test("clicking View Store triggers store navigation only", () => {
    const props = createProps();
    render(<BuyerDashboard {...props} />);

    const productTitle = screen.getByText("Tomato");
    const productCard = productTitle.closest("article");
    const viewStoreButton = within(productCard).getByRole("button", { name: /View Store/i });

    fireEvent.click(viewStoreButton);
    expect(props.onViewStore).toHaveBeenCalledWith("store1");
  });
});
