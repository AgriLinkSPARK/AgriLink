import { jest } from "@jest/globals";
import { sendSuccess, sendCreated, sendError } from "../../utils/responseHandler.js";

describe("Response Handler Unit Tests", () => {
  test("sendSuccess returns consistent success shape", () => {
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    sendSuccess(res, { id: 1 }, "OK");

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "OK",
      data: { id: 1 },
    });
  });

  test("sendCreated returns HTTP 201", () => {
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    sendCreated(res, { id: 2 }, "Created");

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Created",
      data: { id: 2 },
    });
  });

  test("sendError returns consistent error shape", () => {
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    sendError(res, "Boom", 500);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Boom",
    });
  });
});
