import Address from "../../@shared/domain/value-object/address";
import Id from "../../@shared/domain/value-object/id.value-object";
import InovoiceItem from "../domain/Invoice-item";
import Invoice from "../domain/invoice";
import InvoiceGateway from "../gateway/invoice.gateway";
import { InvoiceItemModel } from "./invoice-item.model";
import { InvoiceModel } from "./invoice.model";

export default class InvoiceRepository implements InvoiceGateway {
    async generate(entity: Invoice): Promise<void> {
        await InvoiceModel.create({
            id: entity.id.id,
            name: entity.name,
            document: entity.document,
            street: entity.address.street,
            number: entity.address.number,
            complement: entity.address.complement,
            city: entity.address.city,
            state: entity.address.state,
            zipcode: entity.address.zipCode,
            total: entity.total,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
            items: entity.items.map((item) => {
                return {
                    id: item.id.id,
                    name: item.name,
                    price: item.price
                }
            }),


        }, { include: [{ model: InvoiceItemModel }], }
        );
    }

    async find(id: string): Promise<Invoice> {
        const resut = await InvoiceModel.findOne({ where: { id: id }, include: [InvoiceItemModel] });

        if (!resut) {
            throw new Error("Invoice not found");
        }

        return new Invoice(
            {
                id: new Id(resut.id),
                name: resut.name,
                document: resut.document,
                address: new Address(
                    resut.street,
                    resut.number,
                    resut.complement,
                    resut.city,
                    resut.state,
                    resut.zipcode,
                ),
                items: resut.items.map((item) => {
                    return new InovoiceItem(
                        item.id,
                        item.name,
                        item.price
                    )
                }),
                createdAt: resut.createdAt,
                updatedAt: resut.updatedAt
            }
        );
    }
}