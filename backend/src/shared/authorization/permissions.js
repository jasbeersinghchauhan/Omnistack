export const PERMISSIONS = Object.freeze({
    CATEGORY_READ: "category:read",
    CATEGORY_CREATE: "category:create",
    CATEGORY_UPDATE: "category:update",
    CATEGORY_DELETE: "category:delete",

    PRODUCT_READ: "product:read",
    PRODUCT_CREATE: "product:create",
    PRODUCT_UPDATE: "product:update",
    PRODUCT_DELETE: "product:delete",

    SELLER_READ: "seller:read",
    SELLER_CREATE: "seller:create",
    SELLER_UPDATE: "seller:update",
    SELLER_DELETE: "seller:delete",

    SELLER_PRODUCT_READ: "seller_product:read",
    SELLER_PRODUCT_CREATE: "seller_product:create",
    SELLER_PRODUCT_UPDATE: "seller_product:update",
    SELLER_PRODUCT_DELETE: "seller_product:delete",

    INVENTORY_STOCK_IN: "inventory:stock_in",
    INVENTORY_STOCK_OUT: "inventory:stock_out",

    PRESENCE_READ: "presence:read",
    PRESENCE_UPDATE: "presence:update",

    DASHBOARD_READ: "dashboard:read",
});

export const ROLE_PERMISSIONS = Object.freeze({
    customer: new Set([
        PERMISSIONS.CATEGORY_READ,
        PERMISSIONS.PRODUCT_READ,
        PERMISSIONS.SELLER_READ,
        PERMISSIONS.SELLER_PRODUCT_READ,
        PERMISSIONS.PRESENCE_READ,
        PERMISSIONS.DASHBOARD_READ,
    ]),

    seller: new Set([
        PERMISSIONS.CATEGORY_READ,
        PERMISSIONS.PRODUCT_READ,
        PERMISSIONS.SELLER_READ,
        PERMISSIONS.SELLER_UPDATE,
        PERMISSIONS.SELLER_PRODUCT_READ,
        PERMISSIONS.SELLER_PRODUCT_CREATE,
        PERMISSIONS.SELLER_PRODUCT_UPDATE,
        PERMISSIONS.SELLER_PRODUCT_DELETE,
        PERMISSIONS.INVENTORY_STOCK_IN,
        PERMISSIONS.INVENTORY_STOCK_OUT,
        PERMISSIONS.PRESENCE_READ,
        PERMISSIONS.PRESENCE_UPDATE,
        PERMISSIONS.DASHBOARD_READ,
    ]),

    admin: new Set(Object.values(PERMISSIONS)),
});

export const hasPermission = (role, permission) => {
    return ROLE_PERMISSIONS[role]?.has(permission) ?? false;
};