'use strict';
const { Spot } = require('../models');
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA; 
}
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */

    await Spot.bulkCreate([
      {
        ownerId: 1,
        address: '1912 Ford Dr',
        city: 'Orlando',
        state: 'FL',
        country: 'US',
        lat: 27.235,
        lng: 124.14,
        name: "Beach House",
        description: 'Beach',
        price: 150,
      },
      {
        ownerId: 1,
        address: '124124 Carmel Lane',
        city: 'Saint Louis',
        state: 'MO',
        country: 'US',
        lat: 257.235,
        lng: 124.14,
        name: "Arch",
        description: 'Arch Home',
        price: 450,
      },
      {
        ownerId: 1,
        address: '1231 Apple Tr Lane',
        city: 'Maint Mouis',
        state: 'MO',
        country: 'US',
        lat: 257.235,
        lng: 124.14,
        name: "Brick home",
        description: 'Old Town',
        price: 50,
      },
      {
        ownerId: 2,
        address: '1241 Watkins Road',
        city: 'Miami',
        state: 'FL',
        country: 'US',
        lat: 22.235,
        lng: 314.14,
        name: "Mansion",
        description: 'Mansion home',
        price: 200,
      }
    ], {validate: true})
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('Spots', null, {
        address: ['1912 Ford Dr', '124124 Carmel Lane','1231 Apple Tr Lane', '1241 Watkins Road']
    })
  }
};
