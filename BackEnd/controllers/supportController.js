const Support = require('../models/Support');

// @desc    Submit support message
// @route   POST /api/support
// @access  Public
const submitSupportMessage = async (req, res) => {
  const { name, email, subject, message } = req.body;

  try {
    const supportMessage = await Support.create({
      name,
      email,
      subject,
      message,
    });

    if (supportMessage) {
      res.status(201).json({ message: 'Support message sent successfully' });
    } else {
      res.status(400).json({ message: 'Invalid data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  submitSupportMessage,
};
