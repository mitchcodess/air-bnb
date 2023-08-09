'use strict';

/** @type {import('sequelize-cli').Migration} */
const { Review } = require('../models')
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
    await Review.bulkCreate([{
      spotId: 1,
      userId: 1,
      review: 'Awesome!',
      stars: 5
    },{
      spotId: 1,
      userId: 2,
      review: 'Trash!',
      stars: 0
    },
    {
      spotId: 2,
      userId: 1,
      review: 'Lovely!',
      stars: 5
    },
    {
      spotId: 2,
      userId: 2,
      review: 'Lovely!',
      stars: 4
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
    await queryInterface.bulkDelete('Reviews', null, {
      spotId: [2, 1]});
  }
};
