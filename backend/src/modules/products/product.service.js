import query from "../../config/db.js";

export const createProductService = async (product) => {
    const { productId, categoryId, productName, brand, description, imageLink } = product;

    const sql = `
                    INSERT INTO product (
                    product_id,
                    category_id,
                    product_name,
                    brand,
                    description,
                    image_link
                    )
                    VALUES ($1, $2, $3, $4, $5, $6)
                    RETURNING *;
                `;

    const values = [productId, categoryId, productName, brand, description, imageLink];

    const rows = await query(sql, values);
    return rows[0];
};

export const getProductsService = async () => {
    const rows = await query(`
                        SELECT *
                        FROM product
                        ORDER BY created_at DESC;
                    `);

    return rows;
};

export const getProductByIdService = async (id) => {
    const rows = await query(
        `
                                SELECT *
                                FROM product
                                WHERE product_id = $1;
                                `,
        [id],
    );

    return rows[0];
};

export const updateProductService = async (id, product) => {
    const { categoryId, productName, brand, description, imageLink } = product;

    const sql = `
                    UPDATE product
                    SET
                    category_id = $1,
                    product_name = $2,
                    brand = $3,
                    description = $4,
                    image_link = $5,
                    updated_at = CURRENT_TIMESTAMP
                    WHERE product_id = $6
                    RETURNING *;
                `;

    const values = [categoryId, productName, brand, description, imageLink, id];

    const rows = await query(sql, values);

    return rows[0];
};

export const deleteProductService = async (id) => {
    const rows = await query(
        `
      DELETE FROM product
      WHERE product_id = $1
      RETURNING *;
    `,
        [id],
    );

    return rows[0];
};
