import { jest } from "@jest/globals";

const mockSendFarmerWelcomeEmail = jest.fn();
const mockSendWelcomeEmail = jest.fn();
const mockBcryptHash = jest.fn();

const mockUserModel = {
  findOne: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  find: jest.fn(),
};

jest.unstable_mockModule("../../models/User.js", () => ({
  default: mockUserModel,
}));

jest.unstable_mockModule("../../utils/mailer.js", () => ({
  sendFarmerWelcomeEmail: mockSendFarmerWelcomeEmail,
  sendWelcomeEmail: mockSendWelcomeEmail,
}));

jest.unstable_mockModule("bcryptjs", () => ({
  default: {
    hash: mockBcryptHash,
  },
}));

const {
  createUser,
  getAllUsers,
  updateUser,
  deleteUser,
} = await import("../../controllers/adminController.js");

const makeRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Admin Controller Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("createUser should return 400 when required fields are missing", async () => {
    const req = { body: { name: "Admin" } };
    const res = makeRes();

    await createUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Name, email, and role are required",
    });
  });

  test("createUser should return 400 when email already exists", async () => {
    mockUserModel.findOne.mockResolvedValue({ _id: "existing-user" });
    const req = {
      body: {
        name: "Admin",
        email: "admin@example.com",
        role: "admin",
      },
    };
    const res = makeRes();

    await createUser(req, res);

    expect(mockUserModel.findOne).toHaveBeenCalledWith({
      email: "admin@example.com",
    });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Email already exists" });
  });

  test("createUser should create a customer and return generated password", async () => {
    mockUserModel.findOne.mockResolvedValue(null);
    mockBcryptHash.mockResolvedValue("hashed-password");
    mockUserModel.create.mockResolvedValue({
      _id: "user-123",
      name: "Customer User",
      email: "customer@example.com",
      role: "customer",
    });

    const req = {
      body: {
        name: "Customer User",
        email: "customer@example.com",
        role: "customer",
      },
    };
    const res = makeRes();

    await createUser(req, res);

    expect(mockBcryptHash).toHaveBeenCalled();
    expect(mockUserModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Customer User",
        email: "customer@example.com",
        password: "hashed-password",
        role: "customer",
      })
    );
    expect(mockSendWelcomeEmail).toHaveBeenCalledWith(
      "customer@example.com",
      "Customer User"
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Customer created successfully",
        user: expect.objectContaining({
          id: "user-123",
          email: "customer@example.com",
          role: "customer",
          password: expect.any(String),
        }),
      })
    );
  });

  test("getAllUsers should return 400 for invalid role filter", async () => {
    const req = { query: { role: "invalid" } };
    const res = makeRes();

    await getAllUsers(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid role filter" });
  });

  test("updateUser should return 400 when password is shorter than 6 chars", async () => {
    mockUserModel.findById.mockResolvedValue({
      _id: "user-123",
      email: "old@example.com",
      role: "customer",
    });

    const req = {
      params: { userId: "user-123" },
      body: { password: "123" },
    };
    const res = makeRes();

    await updateUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Password must be at least 6 characters",
    });
  });

  test("deleteUser should block deleting own account", async () => {
    const req = {
      params: { userId: "admin-123" },
      user: { id: "admin-123", role: "admin" },
    };
    const res = makeRes();

    await deleteUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Cannot delete your own account",
    });
    expect(mockUserModel.findById).not.toHaveBeenCalled();
    expect(mockUserModel.findByIdAndDelete).not.toHaveBeenCalled();
  });
});
