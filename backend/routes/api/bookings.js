const express = require("express");
const bcrypt = require("bcryptjs");
const { check } = require("express-validator");
const { handleValidationErrors } = require("../../utils/validation");
const { setTokenCookie, requireAuth } = require("../../utils/auth");
const {
  User,
  Spot,
  SpotImage,
  Review,
  ReviewImage,
  Booking,
} = require("../../db/models");

const router = express.Router();

//Delete a Booking
router.delete("/:bookingId", requireAuth, async (req, res, next) => {
  const booking = await Booking.findByPk(req.params.bookingId);

  if(!booking) {
    return res.status(404).json({
        message: "Booking couldn't be found"
    });
  }

  const currentDate = new Date()
  const currentDateTime = currentDate.getTime();
  const bookingStartDate = booking.dataValues.startDate
  const bookingBegan2 = new Date(bookingStartDate)
  const bookingStartTime = bookingBegan2.getTime();
 
  if(bookingStartTime < currentDateTime) {
    return res.status(403).json({
        message: "Bookings that have been started can't be deleted"
    })
  }

  const spot = Spot.findOne({
    where: {
      id: booking.spotId,
    },
  });
  if (booking.userId === req.user.id || spot.ownerId === req.user.id) {
    //DO SOMETHING
     await booking.destroy()
     res.json({
        message: "Successfully deleted"
     })
  } else {
    return res.status(403).json({
      message: "Forbidden",
    });
  }

 
});

//Edit a Booking
router.put("/:bookingId", requireAuth, async (req, res, next) => {
  const booking = await Booking.findByPk(req.params.bookingId);
  if (!booking) {
    return res.status(404).json({
      message: "Booking couldn't be found",
    });
  }
    
  if (booking.userId !== req.user.id) {
    return res.status(403).json({
      message: "Forbidden",
    });
  }

 
//TIMES
  const { startDate, endDate } = req.body;
  const startingDate = new Date(startDate);
  // COMPARED VALUE OF THE BOOKING'S DATE
  const bookingStart = startingDate.getTime();
  const endingDate = new Date(endDate);
  // COMPARED VALUE OF THE BOOKING'S DATE
  const bookingEnd = endingDate.getTime();

  //CANNOT EDIT A BOOKING THATS PAST ITS END DATE
  const currentDate = new Date()
  const currentDateTime = currentDate.getTime();
  const bookingFinalDate = booking.dataValues.endDate
  const bookingFinal2 = new Date(bookingFinalDate)
  const bookingFinalTime = bookingFinal2.getTime();
  
  if(bookingFinalTime < currentDateTime) {
    return res.status(403).json({
        message: "Past bookings can't be modified"
    })
  }
  
  if(bookingEnd < bookingStart) {
   return res.status(400).json({
      "message": "Bad Request",
      "errors": {
        "endDate": "endDate cannot be on or before startDate"
      }
    })
  }

  const bookings = await Booking.findAll({
    attributes: ['startDate', 'endDate'],
    where: {
      spotId: booking.spotId
    }
  })

  let bookingsToJSON = [];
  for (let i = 0; i < bookings.length; i++) {
    let booking = bookings[i];
    let jsonSpot = booking.toJSON();
    bookingsToJSON.push(jsonSpot);
  }


  for(let i = 0; i < bookingsToJSON.length; i++) {
    let bookingStartDate = bookingsToJSON[i];
    let bookingEndDate = bookingsToJSON[i];

    let startDate = new Date(bookingStartDate.startDate)
    let endDate = new Date(bookingEndDate.endDate)

    let startDateTime = startDate.getTime();
    let endDateTime = endDate.getTime();
//Comparing bookings startDate with all startDates in the database related to the booking)
    if (bookingStart === startDateTime || (bookingStart >= startDateTime && bookingStart <= endDateTime) || bookingStart === endDateTime) {
      return res.status(403).json(
        {
          "message": "Sorry, this spot is already booked for the specified dates",
          "errors": {
            "startDate": "Start date conflicts with an existing booking",
        }
      })
    }

    if(bookingEnd === startDateTime || (bookingEnd >= startDateTime && bookingStart <= endDateTime) || bookingEnd === endDateTime) {
      return res.status(403).json(
        {
          "message": "Sorry, this spot is already booked for the specified dates",
          "errors": {
            "endDate": "End date conflicts with an existing booking",
        }
      })
    }
  }


  const editedBooking = await booking.update({
    startDate,
    endDate
  })

res.json(
    editedBooking
)
  
});

// Get all of the Current User's Bookings
router.get("/current", requireAuth, async (req, res, next) => {
  const bookings = await Booking.findAll({
    where: {
      userId: req.user.id,
    },
    include: [
      {
        model: Spot,
        include: {
          model: SpotImage,
        },
      },
    ],
  });

  let bookingsToJSON = [];
  for (let i = 0; i < bookings.length; i++) {
    let booking = bookings[i];
    let jsonSpot = booking.toJSON();
    bookingsToJSON.push(jsonSpot);
  }

  console.log(bookingsToJSON[0].Spot.SpotImages);

  //Finding the spot in each booking then taking the spot images of those spots and finding the preview image. Adding that property to the spot object.
  for (let i = 0; i < bookingsToJSON.length; i++) {
    let booking = bookings[i];
    let spotImagesOfCurrentBooking = booking.Spot.SpotImages;

    for (let j = 0; j < spotImagesOfCurrentBooking.length; j++) {
      let image = spotImagesOfCurrentBooking[j];
      if (image.preview === true) {
        bookingsToJSON[i].Spot.prevewImage = image.url;
      }
    }
    if (!bookingsToJSON[i].Spot.prevewImage) {
      bookingsToJSON[i].Spot.prevewImage = "No preview image found";
    }

    delete bookingsToJSON[i].Spot.SpotImages;
  }

  return res.json(bookingsToJSON);
});

module.exports = router;
