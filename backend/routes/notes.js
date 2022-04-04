const express = require("express");
const router = express.Router();
const fetchUser = require("../middleware/fetchUser");
const { body, validationResult } = require("express-validator");
const Notes = require("../models/Notes");

// Route 1: Get all the notes using: GET "api/notes/fetchallnotes".Login required
router.get("/fetchallnotes", fetchUser, async (req, res) => {
    try {
        const notes = await Notes.find({ user: req.user.id });
        res.json(notes);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
      }

});

// Route 2: Adding notes to database: POST "api/notes/addnotes".Login required
router.post(
  "/addnote",
  fetchUser,
  [
    body("title", "Enter a valid title").isLength({ min: 4 }),
    body("description", "Description must be atleast 5 charaters").isLength({
      min: 5
    }),
  ],
  async (req, res) => {
    try {
      const { title, description, tag } = req.body;
      // If there are errors, return bad request and throw the errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const notes = new Notes({
        title,
        description,
        tag,
        user: req.user.id,
      });
      const savedNote = await notes.save();
      res.json(savedNote);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal server error");
    }
  }
);

// Route 3: updating an existing note: PUT"api/notes/updatenotes".Login required
  router.put("/updatenotes/:id",fetchUser,async(req,res)=>{
    const {title,description,tag} = req.body;
    try {
      // Create a newNote object
      const newNotes = {};
    if(title){newNotes.title = title};
    if(description){newNotes.description = description};
    if(tag){newNotes.tag = tag};

    // Find the to be updated and update it
    let note = await Notes.findById(req.params.id);
    if(!note){return res.status(404).send("Invalid request")};

    if(note.user.toString() !== req.user.id){
      return res.status(401).send("Not Allowed");
    }
    note = await Notes.findByIdAndUpdate(req.params.id,{$set:newNotes},{new:true});
    res.json({note});

    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server Error");
    }
  })


// Route 4: Deleting an existing note: Delete "api/notes/deletenotes".Login required
  router.delete("/deletenotes/:id",fetchUser,async(req,res)=>{
    try {
    // Find the note to be deleted and delete it
    let note = await Notes.findById(req.params.id);
    if(!note){return res.status(404).send("Invalid request")};

    if(note.user.toString() !== req.user.id){
      return res.status(401).send("Not Allowed");
    }
    note = await Notes.findByIdAndDelete(req.params.id);
    res.json({"success":"Note has been deleted",note:note});

    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server Error");
    }
  })

module.exports = router;
