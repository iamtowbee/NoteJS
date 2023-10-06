exports.homepage = async(req, res) => {
  const locals = {
    title: "Notella",
    description: "Notella - Free NodeJS Notes App.",
  }
  res.render("index", {
    locals,
    layout: '../views/layouts/front-page'
  });
}

exports.about = async (req, res) =>
{
  const locals = {
    title: "About - Notella",
    description: "Notella - Free NodeJS Notes App.",
  }
  res.render("about", locals);
}