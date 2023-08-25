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
} = require("../../db/models");

const router = express.Router();

// Add an Image to a Review based on the Review's id
router.post("/:reviewId/images", requireAuth, async (req, res, next) => {
  const review = await Review.findByPk(req.params.reviewId);

  if (!review) {
    return res.status(404).json({
      message: "Review couldn't be found",
    });
  }
  if (review.userId !== req.user.id) {
   return res.status(403).json({
      message: "Forbidden",
    });
  }

  const numOfImages = await ReviewImage.count({
    where: {
      reviewId: review.id
    },
  });

  if (numOfImages > 9) {
    return res.status(403).json({
      message: "Maximum number of images for this resource was reached",
    });
  }

  const url = req.body.url;
  const addedImage = await ReviewImage.create({
    reviewId: req.params.reviewId,
    url
  });

  res.json(
    addedImage
  );
});

const validateSpotReview = [
  check("review")
    .exists({ checkFalsy: true })
    .withMessage("Review text is required"),
  check("stars")
    .exists({ checkFalsy: true })
    .withMessage("Stars must be an integer from 1 to 5"),
  handleValidationErrors,
];
// Edit a Review
router.put("/:reviewId",validateSpotReview, requireAuth, async (req, res, next) => {
    
    const reviewToEdit = await Review.findByPk(req.params.reviewId);
    if (!reviewToEdit) {
      return res.status(404).json({
        message: "Review couldn't be found",
      });
    }
    if (reviewToEdit.userId !== req.user.id) {
        return res.status(403).json({
           message: "Forbidden",
         });
       }

    const { review , stars } = req.body;
    const editedReview = await reviewToEdit.update({
      review,
      stars,
    });

    res.json(editedReview);
  }
);

// Delete a Review
router.delete("/:reviewId", requireAuth, async (req, res, next) => {
  const reviewToDelete = await Review.findByPk(req.params.reviewId);

  if (!reviewToDelete) {
    res.status(404).json({
      message: "Review couldn't be found",
    });
  }

  if (reviewToDelete.userId !== req.user.id) {
    return res.status(403).json({
       message: "Forbidden",
     });
   }

  await reviewToDelete.destroy();

  res.json({
    message: "Successfully deleted",
  });
});

// Get all Reviews of the Current User
router.get("/current", requireAuth, async (req, res, next) => {
  const reviews = await Review.findAll({
    where: {
      userId: req.user.id,
    },
    include: {
        model: User,
    },
    include: [
        {
            model: User
        },
        {
            model: Spot,
            include:{model: SpotImage}
        },
        
        {
            model: ReviewImage
        }
    ]
  });

  let reviewsToJSON = [];
  for (let i = 0; i < reviews.length; i++) {
    let currentReview = reviews[i];
    let jsonReview = currentReview.toJSON();
    reviewsToJSON.push(jsonReview);
  }
  for (let i = 0; i < reviewsToJSON.length; i++) {
    let review = reviewsToJSON[i];
    let spotImagesOfCurrentReview = review.Spot.SpotImages;

    for (let j = 0; j < spotImagesOfCurrentReview.length; j++) {
      let image = spotImagesOfCurrentReview[j];
      if (image.preview === true) {
        reviewsToJSON[i].Spot.previewImage = image.url;
      }
    }
    if (!reviewsToJSON[i].Spot.previewImage) {
      reviewsToJSON[i].Spot.previewImage = "No preview image found";
    }
    delete review.Spot.SpotImages;
  }

  console.log(reviewsToJSON[0].Spot)

res.json(
    reviewsToJSON
)
});

module.exports = router;
