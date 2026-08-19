import productModel from "../models/product.model.js";

class ProductDAO {
  async findBySku(sku) {
    return await productModel.findOne({ sku: sku.toUpperCase() });
  }

  async createProduct(productPayload) {
    const product = new productModel(productPayload);
    return await product.save();
  }
}

export default new ProductDAO();