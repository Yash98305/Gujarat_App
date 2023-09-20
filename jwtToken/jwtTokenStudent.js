// Create Token and saving in cookie

const sendToken = (student, statusCode, res) => {
    const token = student.getJWTToken();
  
    // options for cookie
    const options = {
      expires: new Date(
        Date.now() + 15 * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
    };
  
    res.status(statusCode).cookie("token", token, options).json({
      success: true,
      student,
      token,
    });
  };
  
  module.exports = sendToken;
  