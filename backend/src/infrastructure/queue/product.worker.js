import { Worker } from "bullmq";
import { queueConnection } from "./connection.js";
import { prisma } from "../../config/prisma.js";

const processProductCreated = async (job) => {
    const { productId } = job.data;

    const product = await prisma.product.findUnique({
        where: {
            product_id: productId,
        },
    });

    if (!product) {
        throw new Error(`Product ${productId} was not found`);
    }

    console.log(
        `Background processing completed for product ${product.product_id}`
    );

    return {
        productId: product.product_id,
    };
};

export const productWorker = new Worker(
    "product-background",
    processProductCreated,
    {
        connection: queueConnection,
        concurrency: 5,
    }
);

productWorker.on("completed", (job) => {
    console.log(`Product job ${job.id} completed`);
});

productWorker.on("failed", (job, error) => {
    console.error(
        `Product job ${job?.id ?? "unknown"} failed:`,
        error
    );
});

console.log("Product worker started");