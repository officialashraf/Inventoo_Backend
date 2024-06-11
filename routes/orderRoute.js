const express = require("express");
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const { newOrder, getSingalOrder, getMyOrder, getAllOrders, deleteOrders, updateOrders } = require("../controllers/orderController");

router.route("/order/new").post(isAuthenticatedUser, newOrder);
router.route("/order/:id").get(isAuthenticatedUser, getSingalOrder);
router.route("/orders/me").get(isAuthenticatedUser, getMyOrder);
router.route("/admin/orders").get(isAuthenticatedUser, authorizeRoles("admin"), getAllOrders);
router.route("/admin/order/:id").put(isAuthenticatedUser, authorizeRoles("admin"), updateOrders).delete(isAuthenticatedUser, deleteOrders);




module.exports = router;