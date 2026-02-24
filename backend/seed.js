import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/productModel.js';
import User from './models/userModel.js';
import data from './data.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI);

const seedData = async () => {
  try {
    await User.deleteMany();
    await Product.deleteMany();

    const createdUsers = await User.insertMany(data.users);
    const adminUser = createdUsers[0]._id;

    const sampleProducts = data.products.map((product) => {
      return { ...product, user: adminUser };
    });

    await Product.insertMany(sampleProducts);

    console.log('Data Seeded Successfully');
    process.exit();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

seedData();