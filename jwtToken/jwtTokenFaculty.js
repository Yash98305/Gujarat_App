const sendToken = (faculty, statusCode, res) => {
    const token = faculty.getJWTToken();
    const options = {
      expires: new Date(
        Date.now() + 15 * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
    };
    res.status(statusCode).cookie("token", token, options).json({
      success: true,
      faculty,
      token,
    });
  };
  
  module.exports = sendToken;
  