import { Router } from "express";
import {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
} from "./product.controller.js";

import authenticate from "../../shared/middlewares/authenticate.middleware.js";
import authorize from "../../shared/middlewares/authorize.middleware.js";
import { PERMISSIONS } from "../../shared/authorization/permissions.js";

const router = Router();

router.get("/", authenticate, authorize(PERMISSIONS.PRODUCT_READ), getProducts);
router.get("/:id", authenticate, authorize(PERMISSIONS.PRODUCT_READ), getProductById);

router.post("/", authenticate, authorize(PERMISSIONS.PRODUCT_CREATE), createProduct);

router.patch("/:id", authenticate, authorize(PERMISSIONS.PRODUCT_UPDATE), updateProduct);

router.delete("/:id", authenticate, authorize(PERMISSIONS.PRODUCT_DELETE), deleteProduct);

export default router;
