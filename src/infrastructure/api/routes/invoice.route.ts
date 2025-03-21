import express, { Request, Response } from "express";
import InvoiceFacadeFactory from "../../../modules/invoice/factory/invoice.facade.factory";

export const invoiceRoute = express.Router();

invoiceRoute.get("/:id", async (req: Request<{ id: string }>, res: Response) => {
    try {
        const facade = InvoiceFacadeFactory.create();
        const input = {
            id: req.params.id
        };
        res.json(await facade.find(input));
    } catch (err) {
        res.status(500).send(err);
    }
});