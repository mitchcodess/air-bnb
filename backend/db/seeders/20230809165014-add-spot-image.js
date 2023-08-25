'use strict';
const { SpotImage } = require('../models')
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
    await SpotImage.bulkCreate([{
      spotId: 1,
      url: 'google.com',
      preview: true,
    },
    {
      spotId: 2,
      url: 'google.com',
      preview: true,
    },
    {
      spotId: 3,
      url: 'google.com',
      preview: true,
    },
    {
      spotId: 4,
      url: 'google.com',
      preview: true,
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
    await queryInterface.bulkDelete('SpotImages', null, {
      spotId: [1, 2, 3, 4]
    })
  }
};
