const express = require("express");
const { getAllProducts, createProduct, updateProduct, deleteProduct, getProductDetails, createProductReview, getAllUserReviews, deleteUserReviews, getAdminProducts } = require("../controllers/productsControllers");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth")
const router = express.Router();


//Routes
router.route("/products").get(getAllProducts);

router.route("/admin/product/new").post(isAuthenticatedUser, authorizeRoles("admin"), createProduct);
router.route("/admin/products").get(isAuthenticatedUser, authorizeRoles("admin"),getAdminProducts);

router.route("/admin/products/:id").put(isAuthenticatedUser, authorizeRoles("admin"), updateProduct)
    .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteProduct);

router.route("/review").put(isAuthenticatedUser, createProductReview);
router.route("/reviews").get(isAuthenticatedUser, getAllUserReviews).delete( isAuthenticatedUser, deleteUserReviews);


router.route("/products/:id").get(getProductDetails);
module.exports = router;