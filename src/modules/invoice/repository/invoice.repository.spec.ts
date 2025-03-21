import { Sequelize } from "sequelize-typescript";
import Invoice from "../domain/invoice";
import { InvoiceItemModel } from "./invoice-item.model";
import { InvoiceModel } from "./invoice.model";
import Id from "../../@shared/domain/value-object/id.value-object";
import Address from "../../@shared/domain/value-object/address";
import InvoiceItem from "../domain/Invoice-item";
import InvoiceRepository from "./invoice.repository";

describe("Invoice Repository test", () => {

    let sequelize: Sequelize

    beforeEach(async () => {
        sequelize = new Sequelize({
            dialect: 'sqlite',
            storage: ':memory:',
            logging: false,
            sync: { force: true }
        })

        sequelize.addModels([InvoiceModel, InvoiceItemModel])
        await sequelize.sync()
    });

    afterEach(async () => {
        await sequelize.close()
    });

    it("should create a invoice", async () => {
        const item1 = new InvoiceItem(
            new Id().id,
            "item 1",
            100
        );

        const item2 = new InvoiceItem(
            new Id().id,
            "item 2",
            200
        );

        const invoice = new Invoice({
            id: new Id(),
            name: "Lucian",
            document: "1234-5678",
            address: new Address(
                "Rua 123",
                "99",
                "Casa Verde",
                "Criciúma",
                "SC",
                "88888-888"
            ),
            items: [item1, item2],
            createdAt: new Date(),
            updatedAt: new Date()

        });

        const repository = new InvoiceRepository();
        await repository.generate(invoice);

        const invoiceDb = await InvoiceModel.findOne({ where: { id: invoice.id.id }, include: [InvoiceItemModel] });

        expect(invoiceDb).toBeDefined();
        expect(invoiceDb.id).toEqual(invoice.id.id);
        expect(invoiceDb.name).toEqual(invoice.name);
        expect(invoiceDb.document).toEqual(invoice.document);
        expect(invoiceDb.street).toEqual(invoice.address.street);
        expect(invoiceDb.number).toEqual(invoice.address.number);
        expect(invoiceDb.complement).toEqual(invoice.address.complement);
        expect(invoiceDb.city).toEqual(invoice.address.city);
        expect(invoiceDb.state).toEqual(invoice.address.state);
        expect(invoiceDb.zipcode).toEqual(invoice.address.zipCode);
        expect(invoiceDb.createdAt).toStrictEqual(invoice.createdAt)
        expect(invoiceDb.updatedAt).toStrictEqual(invoice.updatedAt)

        expect(invoiceDb.items).toHaveLength(2);

        expect(invoiceDb.items[0].id).toEqual(invoice.items[0].id.id);
        expect(invoiceDb.items[0].name).toEqual(invoice.items[0].name);
        expect(invoiceDb.items[0].price).toEqual(invoice.items[0].price);

        expect(invoiceDb.items[1].id).toEqual(invoice.items[1].id.id);
        expect(invoiceDb.items[1].name).toEqual(invoice.items[1].name);
        expect(invoiceDb.items[1].price).toEqual(invoice.items[1].price);
    });

    it("should find a invoice", async () => {

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

        const repository = new InvoiceRepository();
        const result = await repository.find(invoice.id);        

        expect(result.id.id).toEqual(invoice.id);
        expect(result.name).toEqual(invoice.name);
        expect(result.document).toEqual(invoice.document);
        expect(result.address.street).toEqual(invoice.street);
        expect(result.address.number).toEqual(invoice.number);
        expect(result.address.complement).toEqual(invoice.complement);
        expect(result.address.city).toEqual(invoice.city);
        expect(result.address.state).toEqual(invoice.state);
        expect(result.address.zipCode).toEqual(invoice.zipcode);
        expect(result.total).toEqual(invoice.total);
        expect(result.createdAt).toStrictEqual(invoice.createdAt)
        expect(result.updatedAt).toStrictEqual(invoice.updatedAt)

        expect(result.items).toHaveLength(2);

        expect(result.items[0].id.id).toEqual(item1.id);
        expect(result.items[0].name).toEqual(item1.name);
        expect(result.items[0].price).toEqual(item1.price);

        expect(result.items[1].id.id).toEqual(item2.id);
        expect(result.items[1].name).toEqual(item2.name);
        expect(result.items[1].price).toEqual(item2.price);
    });
});