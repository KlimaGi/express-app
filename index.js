import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import RateLimit from "express-rate-limit";
import helmet from "helmet";
import routes from "./src/routes/crmRoutes";
import jsonwebtoken from "jsonwebtoken";

const app = express();
const PORT = 3000;

// helmet setup
app.use(helmet());

// Rate limit setup
const limiter = new RateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit of number of request per IP
  delayMs: 0, //disables delays
});

// mongoose connection
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/CRMdb", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// bodyparser setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// JWT setup
app.use((req, res, next) => {
  if (
    req.headers &&
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "JWT"
  ) {
    jsonwebtoken.verify(
      req.headers.authorization.split(" ")[1],
      "RESTFULAPIs",
      (err, decode) => {
        if (err) req.user = undefined;
        req.user = decode;
        next();
      }
    );
  } else {
    req.user = undefined;
    next();
  }
});

routes(app);

// serving static files
app.use(express.static("public"));

app.get("/", (req, res) =>
  res.send(`Node and express server is running on port ${PORT}`)
);

app.listen(PORT, () => {
  console.log(`Your server is running on port ${PORT}`);
});
