'use strict';

const { User } = require('../models');
const bcrypt = require("bcryptjs");

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
   
    await User.bulkCreate([
      {
        email: 'mitchelllhu@gmail.com',
        username: 'Mitchell',
        firstName: 'Mitchell',
        lastName: "Hu",
        hashedPassword: bcrypt.hashSync('password')
      },
      {
        email: 'brennanreed@gmail.com',
        firstName: 'Brennan',
        lastName: "Reed",
        username: 'BrennanReed',
        hashedPassword: bcrypt.hashSync('password2')
      },
      {
        email: 'user2@user.io',
        firstName: 'Jean',
        lastName: "Wild",
        username: 'FakeUser2',
        hashedPassword: bcrypt.hashSync('password3')
      }
    ], { validate: true });
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Users';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      username: { [Op.in]: ['Mitchell', 'BrennanReed', 'FakeUser2'] }
    }, {});
  }
};
