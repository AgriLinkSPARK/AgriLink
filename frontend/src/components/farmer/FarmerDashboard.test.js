import { render, screen, fireEvent } from "@testing-library/react";
import FarmerDashboard from "./FarmerDashboard";

function createProps() {
  return {
    data: {
      store: { name: "Green Farm" },
      products: [
        {
          _id: "p1",
          name: "Tomato",
          category: "Vegetables",
          description: "Red fresh tomato",
          price: 100,
          quantity: 10,
          unit: "kg",
          mainImage: "https://example.com/tomato.jpg",
        },
        {
          _id: "p2",
          name: "Banana",
          category: "Fruits",
          description: "Ripe banana",
          price: 80,
          quantity: 8,
          unit: "kg",
          mainImage: "https://example.com/banana.jpg",
        },
      ],
      orders: [],
      totalRevenue: 0,
    },
    user: { _id: "u1", name: "Farmer", email: "farmer@test.com" },
    loading: false,
    error: "",
    actions: {
      logout: jest.fn(),
      updateStore: jest.fn(),
      deleteProduct: jest.fn(),
      fetchInbox: jest.fn().mockResolvedValue([]),
    },
    forceStoreSetup: false,
    onAddProduct: jest.fn(),
    onEditProduct: jest.fn(),
  };
}

describe("FarmerDashboard", () => {
  test("filters products by search input", () => {
    const props = createProps();
    render(<FarmerDashboard {...props} />);

    expect(screen.getByText("Tomato")).toBeInTheDocument();
    expect(screen.getByText("Banana")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/Search my products/i), {
      target: { value: "banana" },
    });

    expect(screen.queryByText("Tomato")).not.toBeInTheDocument();
    expect(screen.getByText("Banana")).toBeInTheDocument();
  });

  test("shows no-match message for search miss", () => {
    const props = createProps();
    render(<FarmerDashboard {...props} />);

    fireEvent.change(screen.getByPlaceholderText(/Search my products/i), {
      target: { value: "xyz" },
    });

    expect(screen.getByText(/No products match your search/i)).toBeInTheDocument();
  });
});
