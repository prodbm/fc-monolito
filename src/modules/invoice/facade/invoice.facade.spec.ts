import { Sequelize } from "sequelize-typescript"
import { InvoiceItemModel } from "../repository/invoice-item.model"
import { InvoiceModel } from "../repository/invoice.model"
import InvoiceFacadeFactory from "../../invoice/factory/invoice.facade.factory"

describe("Invoice Facade test", () => {

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
    })

    afterEach(async () => {
        await sequelize.close()
    })

    it("should create a invoice", async () => {
        const facade = InvoiceFacadeFactory.create();

        const item1 = {
            id: "123",
            name: "Item 1",
            price: 100
        };

        const item2 = {
            id: "456",
            name: "Item 2",
            price: 200
        };

        const input = {
            name: "Lucian",
            document: "1234-5678",
            street: "Rua 123",
            number: "99",
            complement: "Casa Verde",
            city: "Criciúma",
            state: "SC",
            zipCode: "88888-888",
            items: [item1, item2]
        }


        await facade.generate(input);

        const invoice = await InvoiceModel.findOne({ where: { name: "Lucian" }, include: [InvoiceItemModel] });

        console.log(invoice);
        expect(invoice).toBeDefined();
        expect(invoice.name).toEqual(input.name);
        expect(invoice.document).toEqual(input.document);
        expect(invoice.street).toEqual(input.street);
        expect(invoice.number).toEqual(input.number);
        expect(invoice.complement).toEqual(input.complement);
        expect(invoice.city).toEqual(input.city);
        expect(invoice.state).toEqual(input.state);
        expect(invoice.zipcode).toEqual(input.zipCode);
        expect(invoice.items).toHaveLength(2);
        expect(invoice.items[0].id).toEqual(item1.id);
        expect(invoice.items[0].name).toEqual(item1.name);
        expect(invoice.items[0].price).toEqual(item1.price);
        expect(invoice.items[1].id).toEqual(item2.id);
        expect(invoice.items[1].name).toEqual(item2.name);
        expect(invoice.items[1].price).toEqual(item2.price);
    })

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

        const facade = InvoiceFacadeFactory.create();
        const result = await facade.find({ id: invoice.id });

        console.log(result);

        expect(result.id).toEqual(invoice.id);
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
        // expect(result.updatedAt).toStrictEqual(invoice.updatedAt)

        expect(result.items).toHaveLength(2);

        expect(result.items[0].id).toEqual(item1.id);
        expect(result.items[0].name).toEqual(item1.name);
        expect(result.items[0].price).toEqual(item1.price);

        expect(result.items[1].id).toEqual(item2.id);
        expect(result.items[1].name).toEqual(item2.name);
        expect(result.items[1].price).toEqual(item2.price);

    });


})