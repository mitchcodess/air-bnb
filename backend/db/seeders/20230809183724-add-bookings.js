'use strict';
const { Booking } = require('../models')
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
    await Booking.bulkCreate([{
      spotId: 3,
      userId: 1,
      startDate: "2023-8-14",
      endDate: "2023-8-20"
    },
    {
      spotId: 1,
      userId: 2,
      startDate: "2023-8-15",
      endDate: "2023-8-21"
    },{
      spotId: 2,
      userId: 2,
      startDate: "2023-8-23",
      endDate: "2023-8-30"
    }],{validate: true})
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('Bookings', null, {
      spotId: [1, 2, 3]
    })
  }
};
