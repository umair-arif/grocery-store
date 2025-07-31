import UserModel from "../models/userModel.js";

export const updateCart = async (req, res) => {
  try {
    const { cartItems } = req.body;

    await UserModel.findByIdAndUpdate(req.userId, { cartItems });
    res.json({ success: true, message: "Cart updated" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
