import { jest } from "@jest/globals";
import { validateRegisterData, validateLoginData } from "../../validators/authValidator.js";
import { AppError } from "../../utils/errorHandler.js";

describe("Auth Validator Unit Tests", () => {
  test("validateRegisterData calls next for valid payload", () => {
    const req = { body: { name: "John", email: "john@test.com", password: "123456" } };
    const next = jest.fn();

    validateRegisterData(req, {}, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  test("validateRegisterData throws for invalid email", () => {
    const req = { body: { name: "John", email: "invalid", password: "123456" } };

    expect(() => validateRegisterData(req, {}, jest.fn())).toThrow(AppError);
    expect(() => validateRegisterData(req, {}, jest.fn())).toThrow("Invalid email format");
  });

  test("validateLoginData throws when required fields missing", () => {
    const req = { body: { email: "" } };

    expect(() => validateLoginData(req, {}, jest.fn())).toThrow(AppError);
  });

  test("validateLoginData calls next for valid login", () => {
    const req = { body: { email: "john@test.com", password: "123456" } };
    const next = jest.fn();

    validateLoginData(req, {}, next);

    expect(next).toHaveBeenCalledTimes(1);
  });
});
