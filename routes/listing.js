const wrapAsync = require("../utils/wrapAsync.js")
const {isLoggedIn, isOwner , validateListing} = require("../middleware.js")
const listingController = require("../controllers/listings.js")
const multer  = require('multer')
const { storage } = require("../cloudConfig.js")
const upload = multer({ storage })

const express = require("express");
const Listing = require("../models/listing.js")
const router = express.Router();

router.route("/")
//Index Route
.get(wrapAsync(listingController.index))
//Create Route
.post(isLoggedIn , upload.single('listing[image]'), validateListing, wrapAsync(listingController.createListing))


//New route
router.get('/new', isLoggedIn, listingController.renderNewForm);


router.route("/show/:category")
.get(wrapAsync(listingController.renderCategoryListing))

router.route("/search")
.get(wrapAsync(listingController.searchForListing))


router.route("/:id")
//Show Route
.get(wrapAsync(listingController.showListing))
//Update Route
.put(isLoggedIn,isOwner,upload.single('listing[image]') ,validateListing, wrapAsync(listingController.updateListing))
//Delete Route
.delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing))


//Edit Route
router.get('/:id/edit',isLoggedIn, isOwner ,wrapAsync(listingController.renderEditForm));

module.exports = router;