import { Sequelize } from "sequelize-typescript"
import express, { Express } from "express";
import request from "supertest";
import { Umzug } from "umzug"
import Address from "../../../modules/@shared/domain/value-object/address";
import { ProductModel } from "../../../modules/product-adm/repository/product.model";
import { OrderModel } from "../../../modules/checkout/repository/order.model";
import { ClientModel } from "../../../modules/client-adm/repository/client.model";
import StoreCatalogProductModel from "../../../modules/store-catalog/repository/product.model";
import { ProductModel as CheckoutProductModel } from "../../../modules/checkout/repository/product.model";
import { ClientModel as OrderClientModel } from "../../../modules/checkout/repository/client.model";
import { migrator } from "../../../migrations/config-migrations/migrator";
import { productRoute } from "../routes/product.route";
import { checkoutRoute } from "../routes/checkout.route";
import { clientRoute } from "../routes/client.route";
import { invoiceRoute } from "../routes/invoice.route";
import TransactionModel from "../../../modules/payment/repository/transaction.model";
import { InvoiceModel } from "../../../modules/invoice/repository/invoice.model";
import { InvoiceItemModel } from "../../../modules/invoice/repository/invoice-item.model";

describe("E2E Tests - Checkout", () => {
    let sequelize: Sequelize
    const app: Express = express()
    app.use(express.json());
    app.use("/checkout", checkoutRoute);
    app.use("/clients", clientRoute);
    app.use("/invoice", invoiceRoute);
    app.use("/products", productRoute);

    let migration: Umzug<any>;

    beforeEach(async () => {
        sequelize = new Sequelize({
            dialect: 'sqlite',
            storage: ':memory:',            
            logging: true
        })

        await sequelize.addModels([ProductModel, OrderModel, StoreCatalogProductModel, CheckoutProductModel, OrderClientModel, ClientModel, TransactionModel, InvoiceModel, InvoiceItemModel]);
        migration = migrator(sequelize)
        await migration.up()
    })

    afterEach(async () => {
        if (!migration || !sequelize) {
            return
        }
        migration = migrator(sequelize)
        await migration.down()
        await sequelize.close()
    })


    it("should complete a checkout and approve", async () => {
        const inputClient = {
            id: "1",
            name: "Lucian",
            email: "lucian@123.com",
            document: "1234-5678",
            address: new Address(
                "Rua 123",
                "99",
                "Casa Verde",
                "Criciúma",
                "SC",
                "88888-888",
            )
        }
        const clientResponse = await request(app)
            .post("/clients")
            .send(inputClient);

        expect(clientResponse.status).toBe(200);

        const inputProduct = {
            id: "1",
            name: "Product 1",
            description: "Product 1 description",
            purchasePrice: 100,
            stock: 10,
            salesPrice: 200
        }

        const productsResponse = await request(app)
            .post("/products")
            .send(inputProduct);

        expect(productsResponse.status).toBe(200);

        const checkoutInput = {
            clientId: inputClient.id,
            products: [
                {
                    productId: inputProduct.id
                }
            ]
        }
        const checkoutResponse = await request(app)
            .post("/checkout")
            .send(checkoutInput);

        expect(checkoutResponse.status).toBe(200)
        expect(checkoutResponse.body.id).toBeDefined()
        expect(checkoutResponse.body.invoiceId).toBeDefined()
        expect(checkoutResponse.body.status).toEqual("approved")
        // expect(checkoutResponse.body.total).toEqual(productsInput.salesPrice)
        expect(checkoutResponse.body.products[0].productId).toEqual(checkoutInput.products[0].productId)
        expect(checkoutResponse.body.createdAt).toBeDefined()
        expect(checkoutResponse.body.updatedAt).toBeDefined()

        const invoiceResponse = await request(app)
            .get("/invoice/" + checkoutResponse.body.invoiceId)

        expect(invoiceResponse.status).toEqual(200)
        expect(invoiceResponse.body.id).toEqual(checkoutResponse.body.invoiceId)
        // expect(invoiceResponse.body.name).toEqual(clientsInput.name)
        // expect(invoiceResponse.body.document).toEqual(clientsInput.document)
        // expect(invoiceResponse.body.address.street).toEqual(clientsInput.address.street)
        // expect(invoiceResponse.body.address.number).toEqual(clientsInput.address.number)
        // expect(invoiceResponse.body.address.complement).toEqual(clientsInput.address.complement)
        // expect(invoiceResponse.body.address.city).toEqual(clientsInput.address.city)
        // expect(invoiceResponse.body.address.state).toEqual(clientsInput.address.state)
        // expect(invoiceResponse.body.address.zipCode).toEqual(clientsInput.address.zipCode)
        // expect(invoiceResponse.body.items[0].id).toEqual(productsInput.id)
        // expect(invoiceResponse.body.items[0].name).toEqual(productsInput.name)
        // expect(invoiceResponse.body.items[0].price).toEqual(productsInput.salesPrice)
        // expect(invoiceResponse.body.total).toEqual(productsInput.salesPrice)
        expect(invoiceResponse.body.createdAt).toBeDefined()
    });
})