const Notes = require('../models/Notes');
const mongoose = require('mongoose');

// GET /
// Dashboard

exports.dashboard = async (req, res) =>
{
  let perPage = 12;
  let page = req.query.page || 1;

  const locals = {
    title: "Dashboard",
    description: "Notella - Free NodeJS Notes App.",
  }

  try
  {
    Notes.aggregate([
      {
        $sort: {
          createdAt: -1,
        }
      },
      {
        $match:
        {
          user: new mongoose.Types.ObjectId(req.user.id)
        }
      },
      {
        $project: {
          title: {substr: ['$title', 0, 30]},
          body: {substr: ['$body', 0, 100]},
        }
      }
    ])
    .skip(perPage * page - perPage)
    .limit(perPage)
    .exec(function (err, notes) {
      Notes.count()
      .exec(function (err, count) {
        if (err) return next(err)
      });
    });
  
    res.render("dashboard/index", {
    userName: req.user.firstName,
    locals,
    notes,
    layout: '../views/layouts/dashboard',
    current: page,
    pages: Math.ceil(count / perPage),
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