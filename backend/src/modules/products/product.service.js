import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import {
    getCache,
    setCache,
    deleteCache,
} from "../../infrastructure/redis/cache.service.js";
import {
    PRODUCT_CACHE_TTL,
    productCacheKey,
    productsCacheKey,
} from "./product.cache.js";

export const createProductService = async (product) => {
    const {
        productId,
        categoryId,
        productName,
        brand,
        description,
        imageLink,
    } = product;

    const createdProduct = await prisma.product.create({
        data: {
            product_id: productId,
            category_id: categoryId,
            product_name: productName,
            brand,
            description,
            image_link: imageLink,
        },
    });

    await deleteCache(productsCacheKey);

    return createdProduct;
};

export const getProductsService = async () => {
    const cachedProducts = await getCache(productsCacheKey);

    if (cachedProducts) {
        return cachedProducts;
    }

    const products = await prisma.product.findMany({
        orderBy: {
            created_at: "desc",
        },
    });

    await setCache(
        productsCacheKey,
        products,
        PRODUCT_CACHE_TTL
    );

    return products;
};

export const getProductByIdService = async (id) => {
    const cacheKey = productCacheKey(id);

    const cachedProduct = await getCache(cacheKey);

    if (cachedProduct) {
        return cachedProduct;
    }

    const product = await prisma.product.findUnique({
        where: {
            product_id: id,
        },
    });

    if (!product) {
        return null;
    }

    await setCache(
        cacheKey,
        product,
        PRODUCT_CACHE_TTL
    );

    return product;
};

export const updateProductService = async (id, product) => {
    const {
        categoryId,
        productName,
        brand,
        description,
        imageLink,
    } = product;

    try {
        const updatedProduct = await prisma.product.update({
            where: {
                product_id: id,
            },
            data: {
                category_id: categoryId,
                product_name: productName,
                brand,
                description,
                image_link: imageLink,
                updated_at: new Date(),
            },
        });

        await deleteCache(productCacheKey(id));
        await deleteCache(productsCacheKey);

        return updatedProduct;
    } catch (error) {
        if (error.code === "P2025") {
            return null;
        }

        throw error;
    }
};

export const deleteProductService = async (id) => {
    try {
        const deletedProduct = await prisma.product.delete({
            where: {
                product_id: id,
            },
        });

        await deleteCache(productCacheKey(id));
        await deleteCache(productsCacheKey);

        return deletedProduct;
    } catch (error) {
        if ( error.code === "P2025" ) {
            return null;
        }

        throw error;
    }
};
