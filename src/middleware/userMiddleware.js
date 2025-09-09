import jwt from "jsonwebtoken";

const userLoggedIn = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).json({
        message: "Token not Found",
        success: false,
      });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    console.log(decodedToken);

    req.user = decodedToken;

    next();
  } catch (error) {
    console.log("Internal Server Error", error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: error.message,
    });
  }
};

export default userLoggedIn;
