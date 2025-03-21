import { Sequelize } from "sequelize-typescript"
import express, { Express } from "express";
import request from "supertest";
import { InvoiceModel } from "../../../modules/invoice/repository/invoice.model";
import { InvoiceItemModel } from "../../../modules/invoice/repository/invoice-item.model";

import { invoiceRoute } from "../routes/invoice.route";

describe("E2E Tests - Invoices", () => {
  let sequelize: Sequelize
  const app: Express = express()
  app.use(express.json())
  app.use("/invoice", invoiceRoute);

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false
    })

    await sequelize.addModels([InvoiceModel, InvoiceItemModel])
    await sequelize.sync()
  })

  afterEach(async () => {
    await sequelize.close()
  })

  it("should find a invoice by id", async () => {
    const item1 = new InvoiceItemModel({
      id: "1",
      name: "item 1",
      price: 100
    });

    const item2 = new InvoiceItemModel({
      id: "2",
      name: "item 2",
      price: 200
    });

    const invoice = await InvoiceModel.create({
      id: "1",
      name: "Lucian",
      document: "1234-5678",
      street: "Rua 123",
      number: "99",
      complement: "Casa Verde",
      city: "Criciúma",
      state: "SC",
      zipcode: "88888-888",
      total: 300,
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [item1, item2]

    }, { include: [{ model: InvoiceItemModel }], }
    );



    const invoiceResponse = await request(app).get("/invoice/" + invoice.id)
    expect(invoiceResponse.status).toEqual(200)
    expect(invoiceResponse.body.id).toEqual(invoice.id)
    expect(invoiceResponse.body.name).toEqual(invoice.name)
    expect(invoiceResponse.body.document).toEqual(invoice.document)
    expect(invoiceResponse.body.address.street).toEqual(invoice.street)
    expect(invoiceResponse.body.address.number).toEqual(invoice.number)
    expect(invoiceResponse.body.address.complement).toEqual(invoice.complement)
    expect(invoiceResponse.body.address.city).toEqual(invoice.city)
    expect(invoiceResponse.body.address.state).toEqual(invoice.state)
    expect(invoiceResponse.body.address.zipCode).toEqual(invoice.zipcode)
    expect(invoiceResponse.body.items[0].id).toEqual(invoice.items[0].id)
    expect(invoiceResponse.body.items[0].name).toEqual(invoice.items[0].name)
    expect(invoiceResponse.body.items[0].price).toEqual(invoice.items[0].price)
    expect(invoiceResponse.body.items[1].id).toEqual(invoice.items[1].id)
    expect(invoiceResponse.body.items[1].name).toEqual(invoice.items[1].name)
    expect(invoiceResponse.body.items[1].price).toEqual(invoice.items[1].price)
    expect(invoiceResponse.body.total).toEqual(invoice.items[0].price + invoice.items[1].price)
    expect(new Date(invoiceResponse.body.createdAt)).toEqual(invoice.createdAt)
  });
})