import GenerateInvoiceUseCase from "./generate-invoice.usecase";

const MockRepository = () => {
    return {
        generate: jest.fn(),
        find: jest.fn()
    }
}
describe("Generate Invoice use case unit test", () => {

    it("should generate an invoice", async () => {

        const repository = MockRepository();
        const usecase = new GenerateInvoiceUseCase(repository);

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

        const result = await usecase.execute(input);
        expect(repository.generate).toHaveBeenCalled();
        expect(result.id).toBeDefined();
        expect(result.name).toEqual(input.name);
        expect(result.document).toEqual(input.document);
        expect(result.street).toEqual(input.street);
        expect(result.number).toEqual(input.number);
        expect(result.complement).toEqual(input.complement);
        expect(result.city).toEqual(input.city);
        expect(result.state).toEqual(input.state);
        expect(result.zipCode).toEqual(input.zipCode);

        expect(result.items).toHaveLength(2);
        expect(result.items[0].id).toEqual(item1.id);
        expect(result.items[0].name).toEqual(item1.name);
        expect(result.items[0].price).toEqual(item1.price);

        expect(result.items[1].id).toEqual(item2.id);
        expect(result.items[1].name).toEqual(item2.name);
        expect(result.items[1].price).toEqual(item2.price);

    });
});