const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });





module.exports.index = async (req, res)=>{
    let allListings = await Listing.find({});
    res.render("listings/index", {allListings});
}

module.exports.renderNewForm = (req, res)=>{
    res.render("listings/new");
}

module.exports.createListing = async (req, res, next)=>{
    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
    })
    .send()

    // let {title , description, image , price, location, country} = req.body;              It can be done like this as well
    let url = req.file.path;
    let filename = req.file.filename;

    const newListing = new Listing(req.body.listing)
    newListing.owner = req.user._id;
    newListing.image = {url, filename}
    newListing.geometry = response.body.features[0].geometry;
    
    let savedListing = await newListing.save();
    console.log(savedListing)

    req.flash("success", "New Listing Created!")
    res.redirect("/listings");
}

module.exports.showListing = async (req, res)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id).populate({path : "reviews", populate : {path : "author"}}).populate("owner");

    if(!listing){
        req.flash("error", "Listing you requested for does not exist!")
        return res.redirect("/listings")
    }
    res.render("listings/show", {listing});
}


module.exports.renderCategoryListing = async (req, res)=>{
    let requestedCategory = req.params.category;
    let allListings = await Listing.find({category : requestedCategory});
    res.render("listings/index", {allListings});
}


module.exports.searchForListing = async (req, res)=>{
    let search = req.query.q

    // $regex: Matches documents containing the search as a substring.
    // $options: "i": Makes the search case-insensitive (so "Beach" and "beach" both match).

    const allListings = await Listing.find({
      $or: [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } }
      ]
    })
    res.render("listings/index", {allListings})
}


module.exports.renderEditForm = async (req, res)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);

    if(!listing){
        req.flash("error", "Listing you requested for does not exist!")
        return res.redirect("/listings")
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250")

    res.render("listings/edit", {listing , originalImageUrl});
}

module.exports.updateListing = async (req, res)=>{

    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
    })
    .send()

    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});
    listing.geometry = response.body.features[0].geometry;

    if(typeof req.file !=="undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url, filename}
    }
    await listing.save()
    
    req.flash("success", "Listing Updated!")
    res.redirect(`/listings/${id}`);
}

module.exports.destroyListing = async (req, res)=>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!")
    res.redirect(`/listings`);
}