import Review from "../models/Review.js";
import asyncHandler from "../middleware/asyncHandler.js";

// CREATE
export const createReview = asyncHandler(async (req, res) => {
  const review = await Review.create(req.body);
  res.status(201).json(review);
});

// GET ALL
export const getAllReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find();
  res.json(reviews);
});

// GET BY ID
export const getReviewById = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error("Review not found");
  }

  res.json(review);
});

// UPDATE
export const updateReview = asyncHandler(async (req, res) => {
  const updated = await Review.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  if (!updated) {
    res.status(404);
    throw new Error("Review not found");
  }

  res.json(updated);
});

// DELETE
export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error("Review not found");
  }

  await review.deleteOne();
  res.json({ message: "Review deleted successfully" });
});