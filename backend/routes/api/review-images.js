const express = require('express');
const bcrypt = require('bcryptjs');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { User, Spot, SpotImage, Review, ReviewImage } = require('../../db/models');
const router = express.Router();

// Delete a Review Image
router.delete('/:imageId',requireAuth, async (req, res, next) => {
    
    const imageToDelete = await ReviewImage.findByPk(req.params.imageId)
    if(!imageToDelete) {
        return res.status(404).json({
            message: "Review Image couldn't be found"
        });
    }
    const review = await Review.findOne({
        where: {
         id: imageToDelete.reviewId
        }
    })

    if(review.userId !== req.user.id) {
      return res.status(403).json({
            message: "Forbidden"
        }); 
    }

     await imageToDelete.destroy()
    res.json({
        message: "Successfully deleted"
    })
})



module.exports = router;