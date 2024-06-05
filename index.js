const express = require("express");
const multer = require("multer");
const tesseract = require("node-tesseract-ocr");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(cors());

const uploadDir = path.join(__dirname, "uploads");

// Ensure the uploads directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Serve static files from the 'uploads' directory
app.use("/uploads", express.static(uploadDir));

// Set view engine
app.set("view engine", "ejs");

// Multer storage configuration
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

// CSP header middleware
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; font-src 'self' data:;"
  );
  next();
});

app.get("/", (req, res) => {
  res.render("index", { data: "" });
});

app.post("/extracttextfromimage", upload.single("file"), (req, res) => {
  console.log(req.file.path);

  const config = {
    lang: "eng",
    oem: 1,
    psm: 3,
  };

  tesseract
    .recognize(req.file.path, config)
    .then((text) => {
      console.log("Result:", text);
      res.render("index", { data: text });
    })
    .catch((error) => {
      console.log(error.message);
      res.status(500).send("Error processing image");
    });
});

app.listen(5000, () => {
  console.log("App is listening on port 5000");
});
