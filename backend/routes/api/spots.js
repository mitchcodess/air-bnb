const express = require("express");
const bcrypt = require("bcryptjs");
const { check } = require("express-validator");
const { query } = require('express-validator');
const { handleValidationErrors } = require("../../utils/validation");
const { setTokenCookie, requireAuth } = require("../../utils/auth");
const {
  User,
  Spot,
  SpotImage,
  Review,
  Booking,
  ReviewImage,
} = require("../../db/models");
const { sequelize } = require("../../db/models");
const router = express.Router();
const { Op } = require("sequelize");

// Create a Booking from a Spot based on the Spot's id
router.post("/:spotId/bookings", requireAuth, async (req, res, next) => {
  const spot = await Spot.findByPk(req.params.spotId);
  if (!spot) {
    res.status(404).json({
      message: "Spot couldn't be found",
    });
  }
  if (spot.ownerId === req.user.id) {
    res.status(403).json({
      message: "Forbidden",
    });
  }

  const { startDate, endDate } = req.body;

  const startingDate = new Date(startDate);
  // COMPARED VALUE OF THE BOOKING'S DATE
  const bookingStart = startingDate.getTime();

  const endingDate = new Date(endDate);
  // COMPARED VALUE OF THE BOOKING'S DATE
  const bookingEnd = endingDate.getTime();
  // Today's Date

  if (bookingEnd < bookingStart) {
    res.status(400).json({
      message: "Bad Request",
      errors: {
        endDate: "endDate cannot be on or before startDate",
      },
    });
  }

  const bookings = await Booking.findAll({
    attributes: ["startDate", "endDate"],
    where: {
      spotId: req.params.spotId,
    },
  });

  let bookingsToJSON = [];
  for (let i = 0; i < bookings.length; i++) {
    let booking = bookings[i];
    let jsonSpot = booking.toJSON();
    bookingsToJSON.push(jsonSpot);
  }

  for (let i = 0; i < bookingsToJSON.length; i++) {
    let bookingStartDate = bookingsToJSON[i];
    let bookingEndDate = bookingsToJSON[i];

    let startDate = new Date(bookingStartDate.startDate);
    let endDate = new Date(bookingEndDate.endDate);

    let startDateTime = startDate.getTime();
    let endDateTime = endDate.getTime();
    //Comparing bookings startDate with all startDates in the database related to the booking)


    // if((bookingStart === startDateTime ||
    //   (bookingStart >= startDateTime && bookingStart <= endDateTime) ||
    //   bookingStart === endDateTime) && (bookingEnd === startDateTime ||
    //   (bookingEnd >= startDateTime && bookingStart <= endDateTime) ||
    //   bookingEnd === endDateTime)) {
    //     return res.status(403).json({
    //       message: "Sorry, this spot is already booked for the specified dates",
    //       errors: {
    //         startDate: "Start date conflicts with an existing booking",
    //         endDate: "End date conflicts with an existing booking",
    //       },
    //   })
    // }


    if(bookingStart <= startDateTime && bookingEnd >= endDateTime) {
      console.log("start before startDate and end after endDate");
     return res.status(403).json({
        "message": "Sorry, this spot is already booked for the specified dates",
        "errors": {
          "startDate": "Start date conflicts with an existing booking",
          "endDate": "End date conflicts with an existing booking",
        }
      });
    } 
  
    //if booking start date is after and end date is before
  if(bookingStart >= startDateTime && bookingEnd <= endDateTime) {
    console.log("start after startDate and end is before endDate");
   return res.status(403).json({
      "message": "Sorry, this spot is already booked for the specified dates",
      "errors": {
        "startDate": "Start date conflicts with an existing booking",
        "endDate": "End date conflicts with an existing booking",
      }
    });
  }


    //If the booking date is before but end date is in before
  
    if(bookingStart <= startDateTime && bookingEnd <= endDateTime && (bookingEnd >= startDateTime)) {
      console.log("start before startdate but end before enddate");
         return res.status(403).json({
           "message": "Sorry, this spot is already booked for the specified dates",
           "errors": {
             "endDate": "End date conflicts with an existing booking",
           }
         });
       }

  //if booking start date is after and end date is after

  if((bookingStart >= startDateTime && bookingEnd >= endDateTime) && (bookingStart <= endDateTime)) {
    console.log("start is after startdate and end is after endDate");
  return res.status(403).json({
      "message": "Sorry, this spot is already booked for the specified dates",
      "errors": {
        "startDate": "Start date conflicts with an existing booking",
      }
    });
  } 




}



  
  
  


  const newBooking = await Booking.create({
    spotId: req.params.spotId,
    userId: req.user.id,
    startDate,
    endDate,
  });

  res.json(newBooking);
});

// Get all Bookings for a Spot based on the Spot's id
router.get("/:spotId/bookings", async (req, res, next) => {
  const spot = await Spot.findByPk(req.params.spotId);
  if (!spot) {
    return res.status(404).json({
      message: "Spot couldn't be found",
    });
  }
  if (spot.ownerId !== req.user.id) {
    console.log("NOT THE owner!");
    let bookings = await Booking.findAll({
      where: {
        spotId: req.params.spotId,
      },
    });
    return res.json(bookings);
  } else if (spot.ownerId === req.user.id) {
    console.log("OWNER!!!");
    let bookings = await Booking.findAll({
      where: {
        spotId: req.params.spotId,
      },
      include: {
        model: User,
      },
    });
    return res.json(bookings);
  }
});

// Get all Bookings for a Spot based on the Spot's id
router.get("/:spotId/bookings", async (req, res, next) => {
  const spot = await Spot.findByPk(req.params.spotId);
  if (!spot) {
    return res.status(404).json({
      message: "Spot couldn't be found",
    });
  }
  if (spot.ownerId !== req.user.id) {
    console.log("NOT THE owner!");
    let bookings = await Booking.findAll({
      where: {
        spotId: req.params.spotId,
      },
    });
    return res.json(bookings);
  } else if (spot.ownerId === req.user.id) {
    console.log("OWNER!!!");
    let bookings = await Booking.findAll({
      where: {
        spotId: req.params.spotId,
      },
      include: {
        model: User,
      },
    });
    return res.json(bookings);
  }
});

// Create a Review for a Spot based on the Spot's id

const validateSpotReview = [
  check("review")
    .exists({ checkFalsy: true })
    .withMessage("Review text is required"),
  check("stars")
    .exists({ checkFalsy: true })
    .withMessage("Stars must be an integer from 1 to 5"),
  handleValidationErrors,
];

router.post(
  "/:spotId/reviews",
  validateSpotReview,
  requireAuth,
  async (req, res, next) => {
    const spot = await Spot.findByPk(req.params.spotId);
    if (!spot) {
      return res.status(404).json({
        message: "Spot couldn't be found",
      });
    }

    console.log(req.params.spotId);
    console.log(req.user.id);

    const reviewAlreadyExists = await Review.findOne({
      where: {
        spotId: req.params.spotId,
        userId: req.user.id,
      },
    });

    console.log(reviewAlreadyExists);

    if (reviewAlreadyExists) {
      return res.status(500).send({
        message: "User already has a review for this spot",
      });
    }
    const { review, stars } = req.body;
    const currentUser = req.user.id;
    const newReview = await Review.create({
      userId: currentUser,
      spotId: parseInt(req.params.spotId),
      review,
      stars,
    });

    res.json(newReview);
  }
);
// Get all Reviews by a Spot's id

router.get("/:spotId/reviews", async (req, res, next) => {
  const spot = await Spot.findByPk(req.params.spotId);

  if (!spot) {
    res.status(404).json({
      message: "Spot couldn't be found",
    });
  }

  const reviews = await Review.findAll({
    where: {
      spotId: req.params.spotId,
    },
    include: [
      {
        model: User,
      },
      {
        model: ReviewImage,
      },
    ],
  });

  res.json({
    Reviews: reviews,
  });
});

router.post("/:spotId/images", async (req, res, next) => {
  const spot = await Spot.findByPk(req.params.spotId);

  if (!spot) {
    res.status(404).json({
      message: "Spot couldn't be found",
    });
  }
  if (spot.ownerId !== req.user.id) {
    res.status(403).json({
      message: "Forbidden",
    });
  }

  const { url, preview } = req.body;
  const image = await SpotImage.create({
    spotId: req.params.spotId,
    url,
    preview,
  });

  res.json({
    id: image.id,
    url: image.url,
    preview: image.preview,
  });
});

router.get("/current", requireAuth, async (req, res, next) => {
  const spots = await Spot.findAll({
    where: {
      ownerId: req.user.id,
    },
    include: [
      {
        model: Review,
      },
      {
        model: SpotImage,
      },
    ],
  });

  let spotToJSON = [];
  for (let i = 0; i < spots.length; i++) {
    let spot = spots[i];
    let jsonSpot = spot.toJSON();
    spotToJSON.push(jsonSpot);
  }
  //Return avgRating for each spot
  for (let i = 0; i < spotToJSON.length; i++) {
    let spot = spotToJSON[i];
    let totalStar = 0;
    let numOfReviews = 0;
    let reviewsOfCurrentSpot = spot.Reviews;
    for (let j = 0; j < reviewsOfCurrentSpot.length; j++) {
      let review = reviewsOfCurrentSpot[j];
      totalStar += review.stars;
      numOfReviews++;
    }
    spotToJSON[i].avgRating = totalStar / numOfReviews;
    delete spot.Reviews;
  }

  //Find previewImage for each spot
  for (let i = 0; i < spotToJSON.length; i++) {
    let spot = spotToJSON[i];
    let spotImagesOfCurrentSpot = spot.SpotImages;

    for (let j = 0; j < spotImagesOfCurrentSpot.length; j++) {
      let image = spotImagesOfCurrentSpot[j];
      if (image.preview === true) {
        spotToJSON[i].prevewImage = image.url;
      }
    }
    if (!spotToJSON[i].prevewImage) {
      spotToJSON[i].prevewImage = "No preview image found";
    }
    delete spot.SpotImages;
  }

  res.json({
    Spots: spotToJSON,
  });
});

router.get("/:spotId", async (req, res, next) => {
  const spots = await Spot.findByPk(req.params.spotId);
  if (!spots) {
    res.status(404).json({
      message: "Spot couldn't be found",
    });
  }
  const numReviews = await spots.countReviews();

  const avgStarRating = await Review.findAll({
    attributes: [
      [sequelize.fn("AVG", sequelize.col("stars")), "avgStarRating"],
    ],
    where: {
      spotId: spots.id,
    },
  });

  console.log();

  const spotImages = await SpotImage.findAll({
    attributes: ["id", "url", "preview"],
    where: {
      spotId: req.params.spotId,
    },
  });

  const owner = await User.findOne({
    attributes: ["id", "firstName", "lastName"],
    where: {
      id: spots.ownerId,
    },
  });

  const payload = {
    id: spots.id,
    ownerId: spots.ownerId,
    address: spots.address,
    city: spots.city,
    state: spots.state,
    country: spots.country,
    lat: spots.lat,
    lng: spots.lng,
    name: spots.name,
    description: spots.description,
    price: spots.price,
    createdAt: spots.createdAt,
    updatedAt: spots.updatedAt,
    numReviews,
    avgStarRating: avgStarRating[0].dataValues.avgStarRating,
    SpotImages: spotImages,
    Owner: owner,
  };

  res.json(payload);
});

const validateNewSpot = [
  check("address")
    .exists({ checkFalsy: true })
    .withMessage("Street address is required"),
  check("city").exists({ checkFalsy: true }).withMessage("City is required"),
  check("state").exists({ checkFalsy: true }).withMessage("State is required"),
  check("country")
    .exists({ checkFalsy: true })
    .withMessage("Country is required"),
  check("lat")
    .exists({ checkFalsy: true })
    .withMessage("Latitude is not valid"),
  check("lng")
    .exists({ checkFalsy: true })
    .withMessage("Longitude is not valid"),
  check("name")
    .exists({ checkFalsy: true })
    .isLength({ max: 50 })
    .withMessage("Name must be less than 50 characters"),
  check("description")
    .exists({ checkFalsy: true })
    .withMessage("Description is required"),
  check("price")
    .exists({ checkFalsy: true })
    .withMessage("Price per day is required"),
  handleValidationErrors,
];

router.put("/:spotId", validateNewSpot, requireAuth, async (req, res, next) => {
  //refactor later helper function
  const spot = await Spot.findByPk(req.params.spotId);
  if (!spot) {
    return res.status(404).json({
      message: "Spot couldn't be found",
    });
  }
  if (spot.ownerId !== req.user.id) {
    return res.status(403).json({
      message: "Forbidden",
    });
  }

  const { address, city, state, country, lat, lng, name, description, price } =
    req.body;
  const editedSpot = await spot.update({
    address,
    city,
    state,
    country,
    lat,
    lng,
    name,
    description,
    price,
  });
  res.json(editedSpot);
});

router.delete("/:spotId", requireAuth, async (req, res, next) => {
  const spot = await Spot.findByPk(req.params.spotId);
  if (!spot) {
    return res.status(404).json({
      message: "Spot couldn't be found",
    });
  }
  if (spot.ownerId !== req.user.id) {
    return res.status(403).json({
      message: "Forbidden",
    });
  }
  await spot.destroy();
  res.json({
    message: "Sucessfully Deleted",
  });
});


const validateSpotQuery = [
  query("page")
  .default(1)
  .isInt({min: 1, max: 10})
  .withMessage("Page must be greater than or equal to 1"),
  query("size")
  .default(20)
  .isInt({min: 1, max: 20})
  .withMessage("Size must be greater than or equal to 1")
  ,
  query("maxLat")
    .isFloat()
    .optional({ nullable: true, checkFalsy: true })
    .withMessage("Maximum latitude is invalid"),
  query("minLat")
  
  .isFloat()
  .optional({ nullable: true, checkFalsy: true })
  .withMessage("Maximum latitude is invalid"),
  query("maxLng")
  .isFloat()
  .optional({ nullable: true, checkFalsy: true })
  .withMessage("Maximum latitude is invalid"),
  query("minLng")
  .isFloat()
  .optional({ nullable: true, checkFalsy: true })
  .withMessage("Maximum latitude is invalid"),
  query("minPrice")
    .isFloat({min: 0})
    .optional({ nullable: true, checkFalsy: true })
    .withMessage("Minimum price must be greater than or equal to 0"),
  query("maxPrice")
    .isFloat({min: 0})
    .optional({ nullable: true, checkFalsy: true })
    .withMessage("Maximum price must be greater than or equal to 0"),
  handleValidationErrors,
];



router.get("/", validateSpotQuery, async (req, res, next) => {
let query = {
  where: {},
  include: []
}

const page = parseInt(req.query.page);
const size = parseInt(req.query.size);

if (page >= 1 && size >= 1) {
    query.limit = size;
    query.offset = size * (page - 1);
}

query.include.push({
  model: Review,
},
{
  model: SpotImage
})


if(req.query.maxLat && req.query.minLat) {
  query.where.lat = { [Op.lt]: `${req.query.maxLat}`, [Op.gt]: `${req.query.minLat}`};
}
else if (req.query.maxLat) {
  query.where.lat = { [Op.lt]: `${req.query.maxLat}`}
}
else if (req.query.minLat) {
  query.where.lat = { [Op.gt]: `${req.query.minLat}`}
}



if(req.query.maxLng && req.query.minLng) {
  query.where.lng = { [Op.lt]: `${req.query.maxLng}`, [Op.gt]: `${req.query.minLng}`}
}
else if (req.query.maxLng) {
  query.where.lng = { [Op.lt]: `${req.query.maxLng}`}
}
else if (req.query.minLng) {
  query.where.lng = { [Op.gt]: `${req.query.minLng}`}
}

if(req.query.maxPrice && req.query.minPrice) {
  query.where.price = { [Op.lt]: `${req.query.maxPrice}`, [Op.gt]: `${req.query.minPrice}`}
}
else if (req.query.maxPrice) {
  query.where.price = { [Op.lt]: `${req.query.maxPrice}`}
}
else if (req.query.minPrice) {
  query.where.price = { [Op.gt]: `${req.query.minPrice}`}
}



  const spots = await Spot.findAll(query);

  let spotToJSON = [];
  for (let i = 0; i < spots.length; i++) {
    let spot = spots[i];
    let jsonSpot = spot.toJSON();
    spotToJSON.push(jsonSpot);
  }
  //Return avgRating for each spot
  for (let i = 0; i < spotToJSON.length; i++) {
    let spot = spotToJSON[i];
    let totalStar = 0;
    let numOfReviews = 0;
    let reviewsOfCurrentSpot = spot.Reviews;
    for (let j = 0; j < reviewsOfCurrentSpot.length; j++) {
      let review = reviewsOfCurrentSpot[j];
      totalStar += review.stars;
      numOfReviews++;
    }
    spotToJSON[i].avgRating = totalStar / numOfReviews;
    delete spot.Reviews;
  }

  //Find previewImage for each spot
  for (let i = 0; i < spotToJSON.length; i++) {
    let spot = spotToJSON[i];
    let spotImagesOfCurrentSpot = spot.SpotImages;

    for (let j = 0; j < spotImagesOfCurrentSpot.length; j++) {
      let image = spotImagesOfCurrentSpot[j];
      if (image.preview === true) {
        spotToJSON[i].prevewImage = image.url;
      }
    }
    if (!spotToJSON[i].prevewImage) {
      spotToJSON[i].prevewImage = "No preview image found";
    }
    delete spot.SpotImages;
  }

  res.json({
    Spots: spotToJSON,
    page,
    size
  });
});

router.post("/", validateNewSpot, async (req, res, next) => {
  const { address, city, state, country, lat, lng, name, description, price } =
    req.body;
  const spot = await Spot.create({
    ownerId: req.user.id,
    address,
    city,
    state,
    country,
    lat,
    lng,
    name,
    description,
    price,
  });

  return res.json(spot);
});

module.exports = router;
