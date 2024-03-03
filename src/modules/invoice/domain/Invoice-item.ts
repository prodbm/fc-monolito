import Id from "../../@shared/domain/value-object/id.value-object";

export default class InovoiceItem {
    private _id: Id;
    private _name: string;
    private _price: number;

    constructor(id: string, name: string, price: number) {
        this._id = new Id(id);
        this._name = name;
        this._price = price;
    }

    get id(): Id {
        return this._id;
    }

    get name(): string {
        return this._name;
    }

    get price(): number {
        return this._price;
    }   
}