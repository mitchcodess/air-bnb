const express = require('express');
const bcrypt = require('bcryptjs');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { User, Spot, SpotImage, Review, ReviewImage, Booking } = require('../../db/models');

const router = express.Router();

//Delete a Booking
router.delete('/:bookingId', requireAuth, async (req, res, next) => {
    const booking = await Booking.findByPk(req.params.bookingId);
    const spot = Spot.findOne({
        where: {
            spotId: booking.spotId
        }
    })
    if(booking.userId === req.user.id || spot.ownerId === req.user.id) {
       //DO SOMETHING
    }
    else {
        return res.status(403).json({
            message: "Forbidden"
        });
    }
})

//Edit a Booking
router.put('/:bookingId', requireAuth, async (req, res, next) => {
   
    const booking = await Booking.findByPk(req.params.bookingId);
   
    if(booking.userId !== req.user.id) {
        return res.status(403).json({
            message: "Forbidden"
        });
    }

    if(!booking) {
        return res.status(404).json({
            message:"Booking couldn't be found"
        })
    }
    
})

// Get all of the Current User's Bookings
router.get('/current',requireAuth, async (req, res, next) => {
    
    
})







module.exports = router;