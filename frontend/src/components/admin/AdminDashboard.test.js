import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AdminDashboard from "./AdminDashboard";

jest.mock("../logistics/LogisticsDashboard", () => () => <div>LogisticsDashboard</div>);
jest.mock("../logistics/CreateLogistics", () => () => null);
jest.mock("../logistics/LogisticsDetails", () => () => null);
jest.mock("../logistics/UpdateStatus", () => () => null);
jest.mock("../logistics/DeleteLogisticsModal", () => () => null);

function createProps() {
  return {
    data: {
      users: [
        { _id: "u1", name: "Alice", email: "alice@test.com", role: "customer", createdAt: "2026-01-01" },
        { _id: "u2", name: "Bob", email: "bob@test.com", role: "farmer", createdAt: "2026-01-02" },
      ],
      products: [{ _id: "p1", name: "Tomato", category: "Vegetables", availability: "in_stock" }],
      logistics: [],
      logisticsPagination: null,
      customers: 1,
      farmers: 1,
      orders: [],
    },
    user: { _id: "a1", name: "Admin", email: "admin@test.com" },
    loading: false,
    error: "",
    actions: {
      logout: jest.fn(),
      createUser: jest.fn().mockResolvedValue({
        user: { email: "new.user@test.com", password: "temp1234", role: "customer" },
      }),
      updateUser: jest.fn().mockResolvedValue({}),
      deleteUser: jest.fn().mockResolvedValue({}),
      fetchLogistics: jest.fn(),
      createLogistics: jest.fn(),
      updateLogistics: jest.fn(),
      deleteLogistics: jest.fn(),
    },
  };
}

describe("AdminDashboard", () => {
  test("filters users by search text", () => {
    const props = createProps();
    render(<AdminDashboard {...props} />);

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/Search by name or email/i), {
      target: { value: "alice" },
    });

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.queryByText("Bob")).not.toBeInTheDocument();
  });

  test("create user form calls actions.createUser", async () => {
    const props = createProps();
    render(<AdminDashboard {...props} />);

    fireEvent.change(screen.getByPlaceholderText("Name"), { target: { value: "New User" } });
    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "new.user@test.com" } });
    fireEvent.change(screen.getAllByRole("combobox")[0], { target: { value: "farmer" } });

    fireEvent.click(screen.getByRole("button", { name: /Create/i }));

    await waitFor(() => {
      expect(props.actions.createUser).toHaveBeenCalledWith({
        name: "New User",
        email: "new.user@test.com",
        role: "farmer",
      });
    });
  });
});
