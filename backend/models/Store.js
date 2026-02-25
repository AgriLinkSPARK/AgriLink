// models/Store.js
import mongoose from "mongoose";

const storeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    location: String,
    phone: String,
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one store per farmer
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual to get products of this store
storeSchema.virtual("products", {
  ref: "Product",      // Product model
  localField: "_id",   // store._id
  foreignField: "store", // product.store
});

export default mongoose.model("Store", storeSchema);



// import mongoose from "mongoose";

// const storeSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },
//     description: String,
//     location: String,
//     phone: String,
//     farmer: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//       unique: true, // one store per farmer
//     },
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Store", storeSchema);
