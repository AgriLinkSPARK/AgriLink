import { jest } from "@jest/globals";
import { sendSuccess, sendCreated, sendError } from "../../utils/responseHandler.js";

describe("Response Handler Unit Tests", () => {
  function createRes() {
    return {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  }

  test("sendSuccess sends standard success payload", () => {
    const res = createRes();

    sendSuccess(res, { id: 1 }, "ok", 200);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "ok",
      data: { id: 1 },
    });
  });

  test("sendCreated sends created payload", () => {
    const res = createRes();

    sendCreated(res, { id: 10 }, "created");

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "created",
      data: { id: 10 },
    });
  });

  test("sendError sends standardized error payload", () => {
    const res = createRes();

    sendError(res, "failed", 500);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "failed",
    });
  });
});
