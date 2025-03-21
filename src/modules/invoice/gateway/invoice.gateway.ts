import Invoice from "../domain/invoice";

export default interface InvoiceGateway {
    generate(client: Invoice): Promise<void>;
    find(id: string): Promise<Invoice>;
}
