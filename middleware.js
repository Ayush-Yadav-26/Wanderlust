const Listing = require("./models/listing");
const Review = require("./models/review.js");
const { listingSchema, reviewSchema } = require("./schema.js")
const ExpressError = require("./utils/ExpressError.js")

module.exports.isLoggedIn = ( req, res, next)=>{
    if(!req.isAuthenticated()){
        //Save Redirect Url 
        req.session.redirectUrl = req.originalUrl;

        req.flash("error", "You must login first");
        return res.redirect("/login")
    }
    next();
}


module.exports.saveRedirectUrl = (req, res, next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}


module.exports.isOwner = async (req, res, next)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner._id.equals(res.locals.currUser._id)){
        req.flash("error", "You are not the owner of this listing")
        return res.redirect(`/listings/${id}`);
    }
    next();
}


module.exports.validateListing = (req, res, next) => {
    if(!req.body || !req.body.listing){
        throw new ExpressError(400, `"listing" is required`)
    }
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMSg = error.details.map((el)=>el.message).join(",")
        throw new ExpressError(400, errMSg)
    }else{
        next();
    }
};



module.exports.validateReview = (req, res, next) =>{
    if(!req.body || !req.body.review){
        throw new ExpressError(400, `"review" is required`)
    }
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errMSg = error.details.map((el)=>el.message).join(",")
        throw new ExpressError(400, errMSg)
    }else{
        next();
    }
}


module.exports.isReviewAuthor = async (req, res, next)=>{
    let {id , reviewId} = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author._id.equals(res.locals.currUser._id)){
        req.flash("error", "You are not the author of this review")
        return res.redirect(`/listings/${id}`);
    }
    next();
}