import Address from "../models/address.js";

export const addAddress = async (req, res) => {
  try {
    const { address } = req.body;
    if (!req.userId) {
      return res.json({ success: false, message: "User not authenticated" });
    }
    await Address.create({ ...address, userId: req.userId });
    res.json({ success: true, message: "Address added successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getAddress = async (req, res) => {
  try {
    // const { userId } = req.body;
    const addresses = await Address.find({ userId: req.userId });
    res.json({ success: true, addresses });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
