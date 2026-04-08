import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";
import { protect, authorize } from "../../middleware/authMiddleware.js";

describe("Auth Middleware Unit Tests", () => {
  test("protect sets req.user for valid token", () => {
    const token = jwt.sign({ id: "u1", role: "customer" }, process.env.JWT_SECRET);
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    protect(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toMatchObject({ id: "u1", role: "customer" });
  });

  test("protect returns 401 when token is missing", () => {
    const req = { headers: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    protect(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "No token" });
  });

  test("authorize blocks users with disallowed roles", () => {
    const req = { user: { role: "customer" } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    authorize("admin", "farmer")(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Not authorized" });
  });
});
