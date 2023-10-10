const Notes = require('../models/Notes');
const mongoose = require('mongoose');

/** 
* GET /
* Dashboard
*/
exports.dashboard = async (req, res) =>
{
  let perPage = 8;
  let page = req.query.page || 1;

  const locals = {
    title: "Dashboard",
    description: "Notella - Free NodeJS Notes App.",
  }

  try
  {
    const notes = await Notes.aggregate([
      {
        $sort: {
          updatedAt: -1,
        }
      },
      {
        $match:
        {
          user: req.user._id
        }
      },
      {
        $project: {
          title: {$substr: ['$title', 0, 25]},
          body: {$substr: ['$body', 0, 100]},
        }
      }
    ])
    .skip(perPage * page - perPage)
    .limit(perPage)
    .exec();

    let countNotes = 0;

    if (notes.length > 0) {
      // Count total notes
      countNotes = await Notes.aggregate().match({ user: req.user._id }).count("count");
      countNotes = countNotes[0].count;
    }
    res.render("dashboard/index", {
    userName: req.user.firstName,
    locals,
    notes,
    layout: '../views/layouts/dashboard',
    current: page,
    pages: Math.ceil(countNotes / perPage),
    countNotes
    });
  } catch (err)
  {
    console.log("Error:", err);
  }
}

exports.about = async (req, res) =>
{
  const locals = {
    title: "About - Notella",
    description: "Notella - Free NodeJS Notes App.",
  }
  res.render("about", locals);
}

/** 
* GET /
* View Specific Note
*/
exports.dashboardViewNote = async (req, res) => {
  const note = await Notes
  .findById({user: req.user.id})
  .where({ _id: req.params.id })
  .lean();

  if(note) {
    res.render('dashboard/view-note', {
      noteId: req.params.id,
      note,
      layout: '../views/layouts/dashboard'
    });
  } else {
    res.status(404).send("Something went wrong.")
  }
}

/** 
* PUT /
* Edit Specific Note
*/
exports.dashboardEditNote = async (req, res) =>
{
  try {
    await Notes.findOneAndUpdate({_id: req.params.id}, {title: req.body.title, body: req.body.body, updatedAt: Date.now()}, {new: true});

    res.redirect('/dashboard');
  } catch (err) {
    console.log(err);
  }
}


/** 
* DELETE /
* Delete Specific Note
*/
exports.dashboardDeleteNote = async (req, res) =>
{
  try
  {
    let updated = await Notes.deleteOne({ _id: req.params.id });
    console.log(updated);

    res.redirect('/dashboard');
  } catch (err)
  {
    console.log(err);
  }
}

/**
 * GET 
 * Add Notes 
 */

exports.dashboardAddNote = async (req, res) => {
  res.render('dashboard/add', {
    layout: '../views/layouts/dashboard'
  });
}

/**
 *  POST /
 * Add Notes
 */

exports.dashboardAddNoteSubmit = async (req, res) =>
{
  try {
    req.body.user = req.user.id;
    await Notes.create(req.body);
    res.redirect('/dashboard');
  } catch (err) {
    console.log(err);
  }
}

/**
 * GET 
 * Search 
 */

exports.dashboardSearch = async (req, res) =>
{
  try {
    res.render('dashboard/search', {
      searchResiults: '',
      layout: '../views/layouts/dashboard'
    })
  } catch (err) {
    console.log(err);
  }
}

/**
* POST
* Search For Notes
*/

exports.dashboardSearchSubmit = async (req, res) =>
{
  try
  {
    let searchTerm = req.body.searchTerm;
    const trimSearchTerm = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "");

    const searchResults = await Notes.find({
      $or: [
        { title: { $regex: new RegExp(trimSearchTerm, 'i')} },
        { body: { $regex: new RegExp(trimSearchTerm, 'i') } },
      ]
    })
    .where( { user: req.user._id });

    res.render('dashboard/search', {
      searchResults,
      layout: '../views/layouts/dashboard'
    })
  } catch (err)
  {
    console.log(err);
  }
}