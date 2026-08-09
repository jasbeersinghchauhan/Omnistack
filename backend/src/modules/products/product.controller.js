import { v7 as uuidv7 } from "uuid";

import {
    createProductService,
    getProductsService,
    getProductByIdService,
    updateProductService,
    deleteProductService,
} from "./product.service.js";

export const createProduct = async (req, res) => {
    try {
        const product = await createProductService({
            productId: uuidv7(),
            ...req.body,
        });

        return res.status(201).json({
            success: true,
            data: product,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getProducts = async (req, res) => {
    try {
        const products = await getProductsService();

        res.status(200).json({
            success: true,
            count: products.length,
            data: products,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch products.",
        });
    }
};

export const getProductById = async (req, res) => {
    try {
        const product = await getProductByIdService(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found.",
            });
        }

        res.status(200).json({
            success: true,
            data: product,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch product.",
        });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const product = await updateProductService(req.params.id, req.body);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found.",
            });
        }

        res.status(200).json({
            success: true,
            data: product,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to update product.",
        });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const product = await deleteProductService(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found.",
            });
        }

        res.status(200).json({
            success: true,
            message: "Product deleted successfully.",
            data: product,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to delete product.",
        });
    }
};
