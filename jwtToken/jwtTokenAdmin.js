const sendToken = (admin, statusCode, res) => {
    const token = admin.getJWTToken();
    const options = {
      expires: new Date(
        Date.now() + 15 * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
    };
    res.status(statusCode).cookie("token", token, options).json({
      success: true,
      admin,
      token,
    });
  };
  
  module.exports = sendToken;
  