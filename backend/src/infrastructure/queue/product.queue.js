import { Queue } from "bullmq";
import { queueConnection } from "./connection.js";

export const productQueue = new Queue("product-background", {
    connection: queueConnection,
});

export const addProductCreatedJob = async (productId) => {
    return productQueue.add(
        "product.created",
        {
            productId,
        },
        {
            attempts: 3,
            backoff: {
                type: "exponential",
                delay: 1000,
            },
            removeOnComplete: 100,
            removeOnFail: 100,
        }
    );
};