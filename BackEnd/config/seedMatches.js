const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const connectDB = require('./db');
const logger = require('../utils/logger');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const maleNames = [
  'Liam', 'Noah', 'Oliver', 'James', 'Elijah', 'William', 'Henry', 'Lucas', 'Benjamin', 'Theodore',
  'Mateo', 'Levi', 'Sebastian', 'Daniel', 'Jack', 'Wyatt', 'Alexander', 'Owen', 'Luke', 'Asher',
  'Silas', 'Leo', 'Julian', 'Hudson', 'Grayson', 'Ezra', 'Gabriel', 'Carter', 'Isaac', 'Jayden',
  'Luca', 'Everett', 'Miles', 'Axel', 'Brooks', 'Wesley', 'Elias', 'Dominic', 'Xavier', 'Lincoln',
  'Ian', 'Tristan', 'Arlo', 'August', 'Bennett', 'Callum', 'Declan', 'Emmett', 'Finn', 'Gael',
  'Hugo', 'Jasper', 'Jude', 'Kai', 'Milo', 'Nico', 'Oscar', 'Otto', 'Phineas', 'Roman'
];

const femaleNames = [
  'Olivia', 'Emma', 'Charlotte', 'Amelia', 'Sophia', 'Mia', 'Isabella', 'Ava', 'Evelyn', 'Luna',
  'Harper', 'Sofia', 'Scarlett', 'Eleanor', 'Hazel', 'Abigail', 'Gianna', 'Aurora', 'Ella', 'Violet',
  'Aria', 'Penelope', 'Chloe', 'Layla', 'Mildred', 'Nora', 'Hazel', 'Lily', 'Grace', 'Willow',
  'Ivy', 'Zoey', 'Stella', 'Emily', 'Maya', 'Everly', 'Leilani', 'Delilah', 'Serenity', 'Alice',
  'Bella', 'Clara', 'Daisy', 'Elena', 'Flora', 'Gia', 'Iris', 'Jade', 'Kira', 'Lola',
  'Mila', 'Nina', 'Olive', 'Piper', 'Quinn', 'Ruby', 'Sienna', 'Talia', 'Vera', 'Zelda'
];

const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

const seedUsers = async () => {
  try {
    await connectDB();
    await User.deleteMany({ email: { $regex: /@example\.com$/ } });

    const users = [];

    // 60 Males
    for (let i = 0; i < 60; i++) {
      const name = maleNames[i % maleNames.length];
      users.push({
        name,
        email: `${name.toLowerCase()}${i}@example.com`,
        password: 'password123',
        avatar: `https://i.pravatar.cc/300?u=${name}${i}`,
        age: Math.floor(Math.random() * (40 - 18 + 1)) + 18,
        gender: 'male',
        sign: signs[Math.floor(Math.random() * signs.length)],
      });
    }

    // 60 Females
    for (let i = 0; i < 60; i++) {
      const name = femaleNames[i % femaleNames.length];
      users.push({
        name,
        email: `${name.toLowerCase()}${i+60}@example.com`,
        password: 'password123',
        avatar: `https://i.pravatar.cc/300?u=${name}${i+60}`,
        age: Math.floor(Math.random() * (40 - 18 + 1)) + 18,
        gender: 'female',
        sign: signs[Math.floor(Math.random() * signs.length)],
      });
    }

    await User.insertMany(users);
    logger.success('120 users seeded successfully!');
    process.exit();
  } catch (error) {
    logger.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedUsers();
