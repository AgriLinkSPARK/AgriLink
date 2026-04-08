import { jest } from "@jest/globals";
import { validateRegisterData, validateLoginData } from "../../validators/authValidator.js";
import { AppError } from "../../utils/errorHandler.js";

describe("Auth Validator Unit Tests", () => {
  test("validateRegisterData calls next for valid payload", () => {
    const req = {
      body: {
        name: "Alice",
        email: "alice@example.com",
        password: "secret123",
      },
    };
    const next = jest.fn();

    validateRegisterData(req, {}, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  test("validateRegisterData throws for invalid email", () => {
    const req = {
      body: {
        name: "Alice",
        email: "not-an-email",
        password: "secret123",
      },
    };

    expect(() => validateRegisterData(req, {}, jest.fn())).toThrow(AppError);
    expect(() => validateRegisterData(req, {}, jest.fn())).toThrow("Invalid email format");
  });

  test("validateLoginData throws when required fields are missing", () => {
    const req = { body: { email: "alice@example.com" } };

    expect(() => validateLoginData(req, {}, jest.fn())).toThrow(AppError);
    expect(() => validateLoginData(req, {}, jest.fn())).toThrow("All fields are required");
  });
});
