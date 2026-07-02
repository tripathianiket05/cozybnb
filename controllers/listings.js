const Listing = require("../models/listing");

module.exports.index = async (req, res) => {
  // Check if a category was clicked in the navbar
  const { category } = req.query;
  let filter = {};
  if (category) {
    filter.category = category;
  }
  
  // Find listings (if filter is empty, finds all)
  const allListings = await Listing.find(filter);
  res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: { path: "author" },
    })
    .populate("owner");
    
  if (!listing) {
    req.flash("error", "Listing you requested does not exist!");
    return res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res) => {
  let coordinates = [0, 0]; 

  // Crash-proof Geocoding
  try {
    const locationQuery = req.body.listing.location;
    const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationQuery)}`;
    
    const response = await fetch(geocodeUrl, {
      headers: { "User-Agent": "Wanderlust_Dev_Project/1.0" }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.length > 0) {
        coordinates = [parseFloat(data[0].lon), parseFloat(data[0].lat)];
      }
    }
  } catch (err) {
    console.log("Warning: Geocoding failed, using default coordinates. Error:", err.message);
  }

  let url = req.file.path;
  let filename = req.file.filename;

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };
  newListing.geometry = {
    type: 'Point',
    coordinates: coordinates
  };
  
  await newListing.save();
  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  
  if (!listing) {
    req.flash("error", "Listing you requested does not exist!");
    return res.redirect("/listings");
  }
  
  let originalImageUrl = listing.image.url;
  let previewImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
  
  res.render("listings/edit.ejs", { listing, previewImageUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }

  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};