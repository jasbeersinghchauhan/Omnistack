import { Router } from "express";
import {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct
} from "./product.controller.js";

import authenticate from "../../shared/middlewares/authenticate.middleware.js";
import authorize from "../../shared/middlewares/authorize.middleware.js";

const router = Router();

router.get("/", getProducts);
router.get("/:id", getProductById);

router.post("/", 
    authenticate,
    authorize("seller", "admin"),
    createProduct
);

router.put("/:id",
    authenticate,
    authorize("seller", "admin"),
    updateProduct
);

router.delete("/:id", 
    authenticate,
    authorize("admin"),
    deleteProduct
);

export default router;