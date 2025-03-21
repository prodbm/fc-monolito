import Address from "../../../@shared/domain/value-object/address";
import Id from "../../../@shared/domain/value-object/id.value-object";
import InovoiceItems from "../../domain/Invoice-item";
import Invoice from "../../domain/invoice";
import InvoiceGateway from "../../gateway/invoice.gateway";
import { GenerateInvoiceUseCaseInputDto, GenerateInvoiceUseCaseOutputDto } from "./generate-invoice.usecase.dto";

export default class GenerateInvoiceUseCase {

    private _invoiceRepository: InvoiceGateway;

    constructor(invoiceRepository: InvoiceGateway) {
        this._invoiceRepository = invoiceRepository;
    }

    async execute(input: GenerateInvoiceUseCaseInputDto): Promise<GenerateInvoiceUseCaseOutputDto> {
        const props = {
            id: new Id(),
            name: input.name,
            document: input.document,
            address: new Address(
                input.street,
                input.number,
                input.complement,
                input.city,
                input.state,
                input.zipCode,
            ),
            items: input.items.map((item) => {
                return new InovoiceItems(item.id, item.name, item.price)
            }),            
        };

        const invoice = new Invoice(props)
        await this._invoiceRepository.generate(invoice)

        return {
            id: invoice.id.id,
            name: invoice.name,
            document: invoice.document,
            street: invoice.address.street,
            number: invoice.address.number,
            complement: invoice.address.complement,
            city: invoice.address.city,
            state: invoice.address.state,
            zipCode: invoice.address.zipCode,
            items: invoice.items.map((item) => {
                return {
                    id: item.id.id,
                    name: item.name,
                    price: item.price
                }
            }),
            total: invoice.total
        }
    }
}