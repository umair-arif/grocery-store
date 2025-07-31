import Order from "../models/order.js";
import Product from "../models/product.js";
import stripe from "stripe";
import UserModel from "../models/userModel.js";

export const placedOrderCOD = async (req, res) => {
  try {
    const { items, address } = req.body;
    const userId = req.userId;
    console.log("user:", userId);
    if (!userId || items.length === 0) {
      return res.json({ success: false, message: "Invalid data" });
    }
    // calculate ammount using items
    let amount = await items.reduce(async (acc, item) => {
      const product = await Product.findById(item.product);
      return (await acc) + product.offerPrice * item.quantity;
    }, 0);
    // add tax charges 2%
    amount += Math.floor(amount * 0.02);

    await Order.create({
      userId,
      amount,
      paymentType: "COD",
      items,
      address,
    });
    return res.json({ success: true, message: "Order Placed Successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const placedOrderStripe = async (req, res) => {
  try {
    const { items, address } = req.body;
    const userId = req.userId;
    const { origin } = req.headers;
    if (!userId || items.length === 0) {
      return res.json({ success: false, message: "Invalid data" });
    }
    let productData = [];
    // calculate ammount using items
    let amount = await items.reduce(async (acc, item) => {
      const product = await Product.findById(item.product);
      productData.push({
        name: product.name,
        price: product.offerPrice,
        quantity: item.quantity,
      });
      return (await acc) + product.offerPrice * item.quantity;
    }, 0);
    // add tax charges 2%
    amount += Math.floor(amount * 0.02);

    const order = await Order.create({
      userId,
      amount,
      paymentType: "Online",
      items,
      address,
    });

    //Stripe Gateway Initialize
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    //Create line items for stripe
    const line_items = productData.map((item) => {
      return {
        price_data: {
          currency: "usd",
          product_data: { name: item.name },
          unit_amount: Math.floor(item.price + item.price * 0.02) * 100,
        },
        quantity: item.quantity,
      };
    });

    //Create session
    const session = await stripeInstance.checkout.sessions.create({
      line_items,
      mode: "payment",
      success_url: `${origin}/loader?next=my-orders`,
      cancel_url: `${origin}/cart`,
      metadata: {
        orderId: order._id.toString(),
        userId,
      },
    });

    return res.json({ success: true, url: session.url });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//Stripe webhook to verify Payments Action: /stripe
export const stripeWebhooks = async (req, res) => {
  const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
  const sig = request.headers["stripe-signature"];
  let event;
  try {
    event = stripeInstance.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    res.status(400).send(`Webhook Error: ${error.message}`);
  }

  //Handle event
  switch (event.type) {
    case "payment_intent.succeded": {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;
      //Getting session metadata
      const session = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });
      const { orderId, userId } = session.data[0].metadata;
      await Order.findByIdAndUpdate(orderId, { isPaid: true });
      await UserModel.findByIdAndUpdate(userId, { cartItems: {} });
      break;
    }
    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;
      //Getting session metadata
      const session = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });
      const { orderId } = session.data[0].metadata;
      await Order.findByIdAndDelete(orderId);
      break;
    }

    default:
      console.log(`Unhandle event type ${event.type}`);
      break;
  }
  res.json({ received: true });
};

export const getUserOrders = async (req, res) => {
  try {
    // const { userId } = req.body;
    const orders = await Order.find({
      userId: req.userId,
      $or: [{ paymentType: "COD" }, { isPaid: true }],
    })
      .populate("items.product address")
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [{ paymentType: "COD" }, { isPaid: true }],
    })
      .populate("items.product address")
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
