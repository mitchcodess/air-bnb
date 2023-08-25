const express = require('express');
const bcrypt = require('bcryptjs');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { User, Spot, SpotImage, Review, ReviewImage } = require('../../db/models');

const router = express.Router();

//Delete a Spot Image
router.delete('/:imageId', requireAuth, async (req, res, next) => {
    const image = await SpotImage.findByPk(req.params.imageId);

    if(!image) {
        return res.status(404).json({
            message: "Spot Image couldn't be found"
        });
    }   

    const spot = await Spot.findOne({
        where:{
            id: image.spotId
        }
    })  

    if(spot.ownerId !== req.user.id) {
       return res.status(403).json({
            message: "Forbidden"
        });
    }

    await image.destroy();
    res.json({
        message: "Successfully deleted"
    })

})



module.exports = router;