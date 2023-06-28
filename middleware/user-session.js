
//=======================LOGIN SESSION========================
const isLogin = async (req, res, next) => {
  try {
    if (req.session.user_id) {
      next();
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//=======================LOGOUT SESSOIN=======================
const isLogout = async (req, res, next) => {
  try {
    if (req.session.user_id) {
      res.redirect("/home");
    } else {
      next();
    }
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  isLogin,
  isLogout,
};
