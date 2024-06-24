import { Book } from "./book";
import { Sale } from "./sale";
import { SaleBookItems } from "./sale-book-item";

export class Rent extends Sale {
    private _refundDate?: Date;
    private _refund?: number;


    constructor(saleBookItems?: Array<SaleBookItems>, operationDateTime?: Date, customerId?: number, operationNumber?: string, total?: number, refundDate?: Date, refund?: number) {
        super(saleBookItems, operationDateTime, customerId, operationNumber, total)

        this._refundDate = refundDate;
        this._refund = refund;
    }


    /**
     * Getter refundDate
     * @return {Date}
     */
    public get refundDate(): Date {
        return this._refundDate!;
    }

    /**
     * Getter refund
     * @return {number}
     */
    public get refund(): number {
        return this._refund!;
    }

    /**
     * Setter refundDate
     * @param {Date} value
     */
    public set refundDate(value: Date) {
        this._refundDate = value;
    }

    /**
     * Setter refund
     * @param {number} value
     */
    public set refund(value: number) {
        this._refund = value;
    }




}