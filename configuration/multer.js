//============= MULTER FOR IMAGE UPLOADE ====================
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/adminassets/imgs"));
  },
  filename: function (req, file, cb) {
    const name = Date.now() + "-" + file.originalname;
    cb(null, name);
  },
});

const imageFilter= function(req,file,cb){
  //accept images only
  if(!file.originalname.match(/\.(jpg|jpeg|png|webp)$/)){
      req.fileValidationerror='only images files are allowed!'
      return cb(new Error('only images files are allowed!'),false)
  }
  cb(null,true)
}

const upload = multer({storage:storage,fileFilter:imageFilter})
// const upload = multer({
//   storage: storage,
//   fileFilter: (req, file, cb) => {
//     if (
//       file.mimetype == "image/png" ||
//       file.mimetype == "image/jpg" ||
//       file.mimetype == "image/jpeg" ||
//       file.mimetype == "image/webp"
//     ) {
//       cb(null, true);
//     } else {
//       cb(null, false);
//       return cb(new Error("Only .png, .jpg and .jpeg .webp format allowed!"));
//     }
//   },
// });
module.exports = upload;
