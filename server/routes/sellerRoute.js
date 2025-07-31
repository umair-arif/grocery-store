import express from "express";
import {
  isSellerAuth,
  logout,
  sellerLogin,
} from "../controllers/sellerController.js";
import authSeller from "../middlewares/authSeller.js";

const sellerRouter = express.Router();

sellerRouter.post("/login", sellerLogin);
sellerRouter.get("/is-seller-auth", authSeller, isSellerAuth);
sellerRouter.get("/logout", logout);

export default sellerRouter;
