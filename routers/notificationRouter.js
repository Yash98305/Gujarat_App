const express = require('express')
const router = express.Router()
const {sendPushNotification} = require('../controllers/notificationController.js')


router.route('/notification').post(sendPushNotification)



module.exports = router
