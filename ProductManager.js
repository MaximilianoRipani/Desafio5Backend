import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  thumbnail: String,
  code: String,
  stock: Number,
});

const Product = mongoose.model('Product', productSchema);

class ProductManager {
  async addProduct(productData) {
    try {
      const product = await Product.create(productData);
      return product;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getProducts() {
    try {
      const products = await Product.find();
      return products;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getProductById(id) {
    try {
      const product = await Product.findById(id);
      return product;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async updateProduct(id, updatedFields) {
    try {
      const product = await Product.findByIdAndUpdate(id, updatedFields, { new: true });
      return product;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async deleteProduct(id) {
    try {
      await Product.findByIdAndDelete(id);
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

export default ProductManager;
