<<<<<<< Updated upstream
// models/Store.js
=======
>>>>>>> Stashed changes
import mongoose from "mongoose";

const storeSchema = new mongoose.Schema(
  {
<<<<<<< Updated upstream
    name: { type: String, required: true },
    description: String,
    location: String,
    phone: String,
=======
>>>>>>> Stashed changes
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
<<<<<<< Updated upstream
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
=======
      unique: true,
    },
    storeName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    image: {
      type: String,
    },
    location: {
      type: String,
    },
    phone: {
      type: String,
    },
    rating: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Store", storeSchema);
>>>>>>> Stashed changes
