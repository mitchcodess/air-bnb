const express = require("express");
const bcrypt = require("bcryptjs");
const { check } = require("express-validator");
const { handleValidationErrors } = require("../../utils/validation");
const { setTokenCookie, requireAuth } = require("../../utils/auth");
const { User, Spot, SpotImage, Review, Booking } = require("../../db/models");
const { sequelize } = require("../../db/models");
const router = express.Router();

// Create a Booking from a Spot based on the Spot's id
router.post("/:spotId/bookings",requireAuth, async (req, res, next) => {
  const spot = await Spot.findByPk(req.params.spotId);
  if (!spot) {
    res.status(404).json({
      message: "Spot couldn't be found",
    });
  }
  if(spot.ownerId === req.user.id){
    res.status(403).json({
      message: "Forbidden"
    })
  }

  const {startDate, endDate} = req.body;

  

  const newBooking = await Booking.create({
    spotId: req.params.spotId,
    userId: req.user.id,
    startDate,
    endDate,
  })


});

// Get all Bookings for a Spot based on the Spot's id
router.get("/:spotId/bookings", async (req, res, next) => {

});

// Create a Review for a Spot based on the Spot's id

const validateSpotReview = [
    check('review')
    .exists({ checkFalsy: true })
    .withMessage('Review text is required'),
  check('stars')
    .exists({ checkFalsy: true })
    .withMessage('Stars must be an integer from 1 to 5'),
    handleValidationErrors
]

router.post("/:spotId/reviews",validateSpotReview, requireAuth, async (req, res, next) => {
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
            userId: req.user.id
        }
    })

   
    console.log(reviewAlreadyExists)

    if (reviewAlreadyExists) {
       return res.status(500).send({
            "message": "User already has a review for this spot"})
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
});
// Get all Reviews by a Spot's id

router.get("/:spotId/reviews", async (req, res, next) => {
  const spot = await Spot.findByPk(req.params.spotId);
  
  if(!spot) {
    res.status(404).json({
      message: "Spot couldn't be found"
    })
  }

  
});

router.post("/:spotId/images", async (req, res, next) => {

    const spot = await Spot.findByPk(req.params.spotId);
   
    if (!spot) {
        res.status(404).json({
          message: "Spot couldn't be found",
        });
      }
    if(spot.ownerId !== req.user.id){
      res.status(403).json({
        message: "Forbidden"
      })
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
    preview: image.preview
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
        }
    ],
  });

  // console.log(spots);
  




  // const avgStarRating = await Review.findOne({
  //   attributes: [
  //     [sequelize.fn("AVG", sequelize.col("stars")), "avgStarRating"],
  //   ],
  //   where: {
  //     spotId: spots.id
  //   },
  // });

  // const payload = {
  //   id: spots.id,
  //   ownerId: spots.ownerId,
  //   address: spots.address,
  //   city: spots.city,
  //   state: spots.state,
  //   country: spots.country,
  //   lat: spots.lat,
  //   lng: spots.lng,
  //   name: spots.name,
  //   description: spots.description,
  //   price: spots.price,
  //   createdAt: spots.createdAt,
  //   updatedAt: spots.updatedAt,
  //   avgStarRating: avgStarRating[0].dataValues.avgStarRating,
  // }

  res.json({
    spots
    // avgStarRating
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
    check('address')
      .exists({ checkFalsy: true })
      .withMessage('Street address is required'),
    check('city')
      .exists({ checkFalsy: true })
      .withMessage('City is required'),
    check('state')
     .exists({ checkFalsy: true })
      .withMessage('State is required'),
    check('country')
      .exists({ checkFalsy: true })
      .withMessage('Country is required'),
      check('lat')
      .exists({ checkFalsy: true })
      .withMessage('Latitude is not valid'),
      check('lng')
      .exists({ checkFalsy: true })
      .withMessage('Longitude is not valid'),
      check('name')
      .exists({ checkFalsy: true })
      .isLength({ max: 50 })
      .withMessage('Name must be less than 50 characters'),
      check('description')
      .exists({ checkFalsy: true })
      .withMessage('Description is required'),
      check('price')
      .exists({ checkFalsy: true })
      .withMessage('Price per day is required'),
    handleValidationErrors
  ];

router.put("/:spotId", validateNewSpot, requireAuth, async (req, res, next) => {
    //refactor later helper function
    const spot = await Spot.findByPk(req.params.spotId);
    if (!spot) {
        return res.status(404).json({
          message: "Spot couldn't be found",
        });
      }
      if(spot.ownerId !== req.user.id){
       return res.status(403).json({
          message: "Forbidden"
        })
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
      if(spot.ownerId !== req.user.id){
       return res.status(403).json({
          message: "Forbidden"
        })
      }
  await spot.destroy();
  res.json({
    message: "Sucessfully Deleted",
  });
});

router.get("/", async (req, res, next) => {
//   const spots = await Spot.findAll({
//     include: [{
//       model: Review
//     },
//    { model: SpotImage}]
//   }
//   );
// for(let i = 0; i < spots.length; i++){
//     let spot = spots[i]
//     const avgRating = await 
// }
  // res.json({Spots:spots});
});


router.post("/",validateNewSpot, async (req, res, next) => {
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
