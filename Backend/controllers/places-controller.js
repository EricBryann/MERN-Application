//Contains all the function relating to retrieving places data

const {validationResult} = require("express-validator");
const HttpError = require("../models/http-error")
const getCoordsForAddress = require("../util/location"); //To change address to coordinates
const Place = require("../models/place");
const User = require("../models/user");
const fs = require("fs"); //To use unlink method

const getPlaceById = async(req, res, next) => {
    const placeId = req.params.pid;
    let place;
    try {
        place = await Place.findById(placeId);
    } catch(err) {
        const error = new HttpError(
            "Something went wrong, could not find a place", 500
        )
        return next(error);
    }

    if (!place) {
       const error =  new HttpError("Could not find a place for the provided id", 404);
       return next(error);
    } 

    res.json({place: place.toObject({getters: true})});
}

const getPlacesByUserId = async(req, res, next) => {
    const userId = req.params.uid;

    let places;
    try{
        places = await Place.find({creator: userId});
    } catch (err) {
        const error = new HttpError(
            "Fetching places failed, please try again later",
            500
        );
        return next(error);
    }

    if (!places) {
        return next(new HttpError("Could not find a place for the provided user id", 404));
     }

    res.json({places: places.map(place => place.toObject({getters: true}))});
}

const createPlace = async(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next (new HttpError("Invalid inputs passed, please check your data", 422));
    } 

    const { title, description, address} = req.body;

    let coordinates;
    try {
        coordinates = await getCoordsForAddress(address);
    } catch (error) {
        return next(error);
    }
    

    const createdPlace = new Place({
        title,
        description,
        address,
        location: coordinates,
        image: req.file.path,
        creator: req.userData.userId
    });

    let user;

    try {
        user = await User.findById(req.userData.userId);
    } catch (err) {
        const error = new HttpError (
            "Creating place failed, please try again", 500
        )
        return next(error);
    }

    if(!user) {
        const error = new HttpError(
            "Could not find user by the provided id", 404
        );
        return next(error);
    }

    console.log(user);

    try {
        await createdPlace.save();
        user.places.push(createdPlace);
        await user.save();
    } catch (err) {
        console.log(err);
        const error = new HttpError ("Creating place failed, please try again.", 500);
        return next(error);
    }
    res.status(201).json({place: createdPlace});
};

const updatePlace = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next (new HttpError("Invalid inputs passed, please check your data", 422));
    }

    const { title, description } = req.body;
    const placeId = req.params.pid;

    let place;
    try {
        place = await Place.findById(placeId);
    } catch (err) {
        const error = new HttpError(
            "Something went wrong, could not update place", 500
        )
        return next(error);
    }

    if (place.creator.toString() !== req.userData.userId) {
        const error = new HttpError(
            "You are not allowed to edit this place", 401
        )
        return next(error);
    }
    place.title = title;
    place.description = description;

    try {
        await place.save();
    } catch(err) {
        const error = new HttpError (
            "Something went wrong, could not update place", 500
        )
        return next(error);
    }

    res.status(200).json({place: place.toObject({getters: true})});
}

const deletePlace = async (req, res, next) => {
    const placeId = req.params.pid;
    
    let place;
    try {
        place = await Place.findById(placeId).populate("creator");
    } catch (err) {
        const error = new HttpError(
            "Something went wrong, could not delete place", 500
        )
        return next(error);
    }

    if(!place) {
        const error = new HttpError(
            "Something went wrong, could not delete place"
        );
        return next(error);
    }

    if (place.creator.id !== req.userData.userId) {
        const error = new HttpError(
            "You are not allowed to delete this place",
            401
        );
        return next(error);
    }

    const imagePath = place.image;

    try {
        await place.remove();
        await place.creator.places.pull(place);
        await place.creator.save();
    } catch (err) {
        const error = new HttpError(
            "Something went wrong, could not delete place", 500
        )
        return next(error);
    }
    fs.unlink(imagePath, (err) => {
        console.log(err);
    });
    res.status(200).json({message: "Deleted place"});
}

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;