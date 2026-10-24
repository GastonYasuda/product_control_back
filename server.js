
require("dotenv").config();
import prisma from "./prisma-db.js";

const express = require("express");
const cors = require("cors");

// const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

//Comprobar la conexión
app.get("/", (req, res) => {
    res.send("Backend funcionando con Prisma");
});


// app.get("/db-test", async (req, res) => {
//     try {
//         const result = await prisma.$queryRaw`
//       SELECT
//         current_database() AS base,
//         current_user AS usuario
//     `;

//         res.json(result[0]);
//     } catch (error) {
//         console.error("Error de PostgreSQL:", error.message);

//         res.status(500).json({
//             error: "No se pudo consultar la base de datos",
//         });
//     }
// });


//------------------------- GET allProducts

app.get("/products", async (req, res) => {
    try {
        const products = await prisma.products.findMany({
            include: {
                category: { select: { category_id: true, category_name: true, category_img: true } },
                supplier: { select: { supplier_id: true, supplier_name: true, supplier_img: true } },
            },
        });

        // res.json(products)

        res.json(products);

    } catch (error) {
        console.error("Error al obtener productos:", error);

        res.status(500).json({
            error: "No se pudieron obtener los productos",
        });
    }
});

//------------------------- GET product

app.get("/products/:id", async (req, res) => {
    const id = Number(req.params.id)

    //valido que el id sea un numero
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: "El id debe ser un número entero positivo" });
    }

    try {
        const product = await prisma.products.findUnique({
            where: {
                product_id: id
            },
            include: {
                category: { select: { category_id: true, category_name: true, category_img: true } },
                supplier: { select: { supplier_id: true, supplier_name: true, supplier_img: true } },
            },
        })
        res.json(product);

    } catch (error) {
        console.error("Error al obtener el producto:", error);

        res.status(500).json({
            error: `No se pudo obtener el producto con id: ${id}`,
        });
    }
})


//------------------------- GET allUsers

app.get("/users", async (req, res) => {
    try {
        const users = await prisma.users.findMany({
            omit: { user_rol: true },
            include: {
                rol: { select: { rol_type: true } },
                orders: true,
                pending_orders: true,

            }
        })


        // res.json(users)

        res.json(
            users.map(({ rol, ...user }) => ({
                user_rol: rol?.rol_type ?? null,
                ...user,
            }))
        )

    } catch (error) {
        console.error("Error al obtener usuarios:", error);

        res.status(500).json({
            error: "No se pudo obtener los usuarios",
        });
    }
})


//------------------------- GET user

app.get("/users/:id", async (req, res) => {

    const id = Number(req.params.id)

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: "El id debe ser un número entero positivo" });
    }

    try {

        const user = await prisma.users.findUnique({
            where: {
                user_id: id
            },
            select: {
                user_name: true,
                rol: {
                    select:
                    {
                        rol_type: true
                    }
                },
                orders: true,
                pending_orders: {
                    select: {
                        products: { select: { product_name: true } },
                        pending_order_quantity: true,
                    }
                }
            }
        })

        //  res.json(user)

        const { user_id, user_name, rol, orders, pending_orders } = user

        res.json({
            user_id: user_id,
            user_name: user_name,
            rol_type: rol?.rol_type ?? null,
            orders: orders,
            pending_orders: pending_orders.map(({ products, ...po_quantity }) => ({
                pending_product_name: products?.product_name ?? null,
                ...po_quantity,
            })),
        });

    } catch (error) {
        console.error("Error al obtener usuario:", error);

        res.status(500).json({
            error: `No se pudo obtener usuario con id: ${id}`,
        });
    }
})

//------------------------- GET allCategories

app.get("/category", async (req, res) => {

    try {
        const category = await prisma.category.findMany({
            select: {
                category_name: true,
                category_img: true,
            }
        })

        res.json(category)

    } catch (error) {
        console.error("Error al obtener las categorias", error);

        res.status(500).json({
            error: `No se pudo obtener las categorias`,
        });
    }
})

//------------------------- GET productsOneCategory
app.get("/category/:id", async (req, res) => {
    const id = req.params.id

    try {
        const categoryProducts = await prisma.products.findMany({
            where: {
                category: { category_name: id },
            },
            omit: {
                product_category: true,
                product_supplier: true,
            },
            include: {
                category: { select: { category_name: true } },
                supplier: { select: { supplier_name: true } }
            }
        })

        res.json(
            categoryProducts.map(({ category, supplier, ...rest }) => ({
                ...rest,
                category: category?.category_name ?? null,
                supplier: supplier?.supplier_name ?? null,
            }))
        )

    } catch (error) {
        console.error("Error al obtener los productos de la categoria:", error);

        res.status(500).json({
            error: `No se pudo obtener productos de la categoria`,
        });
    }

})



//------------------------- GET allSupplier

app.get("/supplier", async (req, res) => {

    try {
        const supplier = await prisma.supplier.findMany({
            select: {
                supplier_name: true,
                supplier_img: true,
            }
        })

        res.json(supplier)

    } catch (error) {
        console.error("Error al obtener las proveedores", error);

        res.status(500).json({
            error: `No se pudo obtener las proveedores`,
        });
    }
})



//------------------------- GET productsOneSupplier
app.get("/supplier/:id", async (req, res) => {
    const id = req.params.id

    try {
        const supplierProducts = await prisma.products.findMany({
            where: {
                supplier: { supplier_name: id },
            },
            omit: {
                product_category: true,
                product_supplier: true,
            },
            include: {
                category: { select: { category_name: true } },
                supplier: { select: { supplier_name: true } }
            }
        })

        res.json(
            supplierProducts.map(({ category, supplier, ...rest }) => ({
                ...rest,
                category: category?.category_name ?? null,
                supplier: supplier?.supplier_name ?? null,
            }))
        )

    } catch (error) {
        console.error("Error al obtener los productos de la categoria:", error);

        res.status(500).json({
            error: `No se pudo obtener productos de la categoria`,
        });
    }

})




//------------------------- GET allOrders

app.get("/orders", async (req, res) => {

    try {
        const orders = await prisma.orders.findMany({
            omit: {
                order_user: true,
                order_status: true,
            },
            include: {
                users: { select: { user_name: true } },
                status: { select: { status_name: true } },
                ordered_products: true,
            }
        })

        // res.json(orders)
        res.json(
            orders.map(({ users, status, ...order }) => ({
                ...order,
                user_name: users?.user_name ?? null,
                status_name: status?.status_name ?? null,
            }))
        );

    } catch (error) {
        console.error("Error al obtener las ordenes", error);

        res.status(500).json({
            error: `No se pudo obtener las ordenes`,
        });
    }
})


//------------------------- GET oneOrder
app.get("/orders/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: "El id debe ser un número entero positivo" });
    }

    try {
        const order = await prisma.orders.findUnique({
            where: { order_id: id },
            select: {
                order_id: true,
                order_date: true,
                status: { select: { status_name: true } },
                users: { select: { user_name: true, user_id: true } },
                ordered_products: {
                    select: {
                        ordered_product_id: true,        // ← agregado
                        product_checked: true,           // ← agregado
                        ordered_product_quantity: true,
                        products: {
                            select: {
                                product_id: true,
                                product_name: true,
                                product_img: true,
                            },
                        },
                    },
                },
            },
        });

        if (!order) {                            // ← agregado
            return res.status(404).json({ error: `No existe la orden id ${id}` });
        }

        const { users, status, ordered_products, ...rest } = order;

        res.json({
            ...rest,
            user_name: users?.user_name ?? null,
            user_id: users?.user_id ?? null,
            status_name: status?.status_name ?? null,
            ordered_products: ordered_products.map(
                ({ ordered_product_id, product_checked, products, ordered_product_quantity }) => ({
                    ordered_product_id,                          // ← agregado
                    product_checked: product_checked ?? false,   // ← agregado
                    product_id: products?.product_id ?? null,
                    product_name: products?.product_name ?? null,
                    product_img: products?.product_img ?? null,
                    ordered_quantity: ordered_product_quantity ?? null,
                })
            ),
        });
    } catch (error) {
        console.error("Error al obtener la orden", error);
        res.status(500).json({ error: `No se pudo obtener la orden id ${id}` });
    }
});


//------------------------- GET userOrder



app.get("/users/:id/orders", async (req, res) => {

    const id = Number(req.params.id)

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: "El id debe ser un número entero positivo" });
    }

    try {
        const order = await prisma.orders.findMany({
            where: {
                users: { user_id: id },
            },
            select: {
                order_id: true,
                order_date: true,
                status: { select: { status_name: true } },
                users: { select: { user_name: true } },
                ordered_products: {
                    select: {
                        products: { select: { product_name: true } },
                        ordered_product_quantity: true,
                    }
                },
            }
        })

        res.json(
            order.map(({ users, status, ordered_products, ...rest }) => ({
                ...rest,
                user: users?.user_name ?? null,
                status: status?.status_name ?? null,
                ordered_products: ordered_products.map(({ products, ...op }) => ({
                    product_name: products?.product_name ?? null,
                    ...op,
                })),

            }))
        )


    } catch (error) {
        console.error(`Error al obtener ordenes del usuario`, error);

        res.status(500).json({
            error: `No se pudo obtener ordenes del usuario id: ${id}`,
        });
    }
})

//------------------------- PATCH updateOrder
app.patch("/orders/:id", async (req, res) => {
    const id = Number(req.params.id);
    const { orderedProductsUpdated } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: "Id inválido" });
    }
    if (!Array.isArray(orderedProductsUpdated) || orderedProductsUpdated.length === 0) {
        return res.status(400).json({ error: "orderedProductsUpdated debe ser un array con elementos" });
    }

    try {
        const updated = await prisma.orders.update({
            where: { order_id: id },
            data: {
                ordered_products: {
                    update: orderedProductsUpdated.map((p) => ({
                        where: { ordered_product_id: Number(p.ordered_product_id) },
                        data: { product_checked: p.product_checked },
                    })),
                },
            },
            select: {
                ordered_products: {
                    select: {
                        product_checked: true,
                        ordered_product_id: true,
                    }
                }
            },
        });

        res.json(updated);
    } catch (error) {
        console.error(error);
        if (error.code === "P2025") {
            return res.status(404).json({ error: "Orden o producto no encontrado" });
        }
        res.status(500).json({ error: "Error al actualizar" });
    }
});


//------------------------- ADD order

app.post("/addOrder", async (req, res) => {
    const { user_id, products } = req.body;

    // Validaciones básicas
    if (!Number.isInteger(user_id) || user_id <= 0) {
        return res.status(400).json({ error: "user_id inválido" });
    }
    if (!Array.isArray(products) || products.length === 0) {
        return res.status(400).json({ error: "La orden debe tener al menos un producto" });
    }
    const invalido = products.some(
        (p) => !Number.isInteger(p.product_id) || !Number.isInteger(p.quantity) || p.quantity <= 0
    );
    if (invalido) {
        return res.status(400).json({ error: "Cada producto necesita product_id y quantity enteros positivos" });
    }

    try {
        const order = await prisma.orders.create({
            data: {
                order_user: user_id,//id del usuario
                ordered_products: {
                    create: products.map((p) => ({
                        product_id: p.product_id,//id del producto
                        ordered_product_quantity: p.quantity,//cantidad del producto
                    })),
                },
            },
            select: {
                order_id: true,
                order_date: true,
                status: { select: { status_name: true } },
                users: { select: { user_name: true } },
                ordered_products: {
                    select: {
                        products: { select: { product_name: true } },
                        ordered_product_quantity: true,
                    }
                },
            },
        });

        const { users, status, ordered_products, ...rest } = order;

        res.status(201).json({
            ...rest,
            user_name: users?.user_name ?? null,
            status_name: status?.status_name ?? null,
            ordered_products: ordered_products.map(({ products, ...op }) => ({
                product_name: products?.product_name ?? null,
                ...op,
            })),
        })


    } catch (error) {
        // P2003: violación de clave foránea (usuario o producto inexistente)
        if (error.code === "P2003") {
            return res.status(400).json({ error: "El usuario o algún producto no existe" });
        }
        console.error("Error al crear la orden:", error);
        res.status(500).json({ error: "No se pudo crear la orden" });
    }
});



//------------------------- GET pending_products
app.get("/users/:id/pending", async (req, res) => {
    const userId = Number(req.params.id);
    try {
        const items = await prisma.pending_orders.findMany({
            where: { pending_order_user: userId },
            select: {
                product_id: true,
                pending_order_quantity: true,
                products: { select: { product_name: true } },
            },
        });

        res.json(items.map(({ products, ...item }) => ({
            product_name: products?.product_name ?? null,
            ...item,
        })));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "No se pudo obtener el carrito" });
    }
});


//------------------------- ADD pending_products

app.put("/users/:id/pending", async (req, res) => {
    const userId = Number(req.params.id);
    const { product_id, quantity } = req.body;

    if (!Number.isInteger(product_id) || !Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).json({ error: "product_id y quantity deben ser enteros positivos" });
    }

    try {
        const item = await prisma.pending_orders.upsert({
            where: {
                pending_order_user_product_id: {
                    pending_order_user: userId,
                    product_id,
                },
            },
            update: { pending_order_quantity: quantity },
            create: {
                pending_order_user: userId,
                product_id,
                pending_order_quantity: quantity,
            },
        });
        res.json(item);

    } catch (error) {
        if (error.code === "P2003") {
            return res.status(400).json({ error: "El usuario o el producto no existe" });
        }
        console.error(error);
        res.status(500).json({ error: "No se pudo actualizar el carrito" });
    }
});

//------------------------- DELETE pending_products

app.delete("/users/:id/pending/:productId", async (req, res) => {
    const userId = Number(req.params.id);
    const productId = Number(req.params.productId);
    try {
        const result = await prisma.pending_orders.deleteMany({
            where: { pending_order_user: userId, product_id: productId },
        });
        if (result.count === 0) {
            return res.status(404).json({ error: "El producto no está en el carrito" });
        }
        res.status(204).send().json({ message: 'Eliminado correctamente' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "No se pudo quitar el producto" });
    }
});





const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});

