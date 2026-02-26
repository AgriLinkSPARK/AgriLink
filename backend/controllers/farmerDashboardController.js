// controllers/farmerAnalyticsController.js
import Product from "../models/Product.js";
import Store from "../models/Store.js";
//import Order from "../models/Order.js"; // assuming you have an Order model

export const getDashboardAnalytics = async (req, res) => {
  try {
    // 1. Find farmer's store
    const store = await Store.findOne({ farmer: req.user.id });
    if (!store) return res.status(404).json({ message: "Store not found" });

    // 2. Total number of products
    const totalProducts = await Product.countDocuments({ store: store._id });

    // 3. Low stock products (optional threshold = 10)
    const lowStockProducts = await Product.find({ store: store._id, quantity: { $lte: 10 } });

    // 4. Total revenue
    const orders = await Order.find({ "products.store": store._id, status: "delivered" });
    const totalRevenue = orders.reduce((sum, order) => {
      // sum all products in this store from this order
      const storeProducts = order.products.filter(p => p.store.toString() === store._id.toString());
      const revenue = storeProducts.reduce((s, p) => s + p.price * p.quantity, 0);
      return sum + revenue;
    }, 0);

    // 5. Top-selling products
    const productSalesMap = {};
    orders.forEach(order => {
      order.products.forEach(p => {
        if (p.store.toString() === store._id.toString()) {
          productSalesMap[p.product.toString()] = (productSalesMap[p.product.toString()] || 0) + p.quantity;
        }
      });
    });

    // Convert map to array
    const topProducts = Object.entries(productSalesMap)
      .sort((a, b) => b[1] - a[1]) // sort descending
      .slice(0, 5); // top 5

    // Optionally populate product names
    const topProductsData = await Product.find({ _id: { $in: topProducts.map(p => p[0]) } });

    // Build response
    res.json({
      totalProducts,
      lowStockProducts: lowStockProducts.map(p => ({ id: p._id, name: p.name, quantity: p.quantity })),
      totalRevenue,
      topProducts: topProductsData.map(p => ({
        id: p._id,
        name: p.name,
        soldQuantity: productSalesMap[p._id.toString()],
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};