import { stockService } from "..";
import { Book } from "../domain/book";
import { Rent } from "../domain/rent";
import { RentCart } from "../domain/rent-cart";

export class RentService {
    private _rentList: Array<Rent>;

    private _rentCart: RentCart;
    public rentApi = 'http://localhost:3002/api/rents';
    refundPercent: number;


    constructor(rentList: Array<Rent>, rentCart: RentCart) {
        this._rentList = rentList;
        this.refundPercent = 0.75;
        this._rentCart = rentCart;
    }

    /**
     * Getter rentList
     * @return {Array<Rent>}
     */
    public get rentList(): Array<Rent> {
        return this._rentList;
    }

    /**
     * Setter rentList
     * @param {Array<Rent>} value
     */
    public set rentList(value: Array<Rent>) {
        this._rentList = value;
    }

    /**
     * Getter rentCart
     * @return {RentCart}
     */
    public get rentCart(): RentCart {
        return this._rentCart;
    }

    /**
     * Setter rentCart
     * @param {RentCart} value
     */
    public set rentCart(value: RentCart) {
        this._rentCart = value;
    }

    public addRent(rent: Rent): void {
        this.rentList.push(rent);
    }

    /**
     * Kitapların hepsi sepete eklendikten sonra toplma ücreti hesaplauan fonksiyon
     * @param rent Kitapların listesinin bulunduğu nesne
     * @returns Toplam ücret
     */
    public calculateTotal(rent: Rent): number {

        let map: Map<Book, number> = rent.bookAndQuantityMap;

        let subTotal: number = 0;

        //it can be => let entry of rent.bookAndQuantityMap.entries()
        for (let entry of rent.bookAndQuantityMap) {
            subTotal += entry[0].bookSpecification.price * entry[1];
        }

        return subTotal;
    }

    // R051022145509 => domain.Rent 05.10.2022 14:55.09
    generateRentNumber(customerId: number): string {
        let today = new Date();
        let receiptNumber: string = "R" + today.getDay().toString + today.getMonth().toString + today.getFullYear().toString + today.getHours().toString + today.getMinutes().toString + today.getSeconds().toString + customerId.toString;

        return receiptNumber;
    }

    /**
     * 
     * @param d1 Kitaplaın kiralık olarak alındığı tarih
     * @param d2 Kitapların geri getirildiği tarih
     * @returns İki tarih arasındaki fark (saat olarak)
     */
    public calculateDiffHours(d1: Date, d2: Date): number {

        let diffMilis: number = (d1.getTime() - d2.getTime());// mili seconds
        let diffHour = Math.floor(diffMilis / 1000 / 60 / 60); // /1000 > second / 60 > min / 60 > hour
        return diffHour;
    }

    /**
     * Kitap ilk kiralandığı anda, zamanında getirildiği gibi düşünülerek verilecek olan varsayılan geri ödeme miktarı
     * @param rent Hesaplanacak olan geri ödeme miktarının içinde bulunduğu nesne
     */
    public calculateRefund(rent: Rent): void {
        rent.refund = rent.total * this.refundPercent;
    }

    /**
     * Kitap kiralandı, okundu ve geri getirildiği zaman ne kadar geri ödeme verileceğini hesaplar
     * @param rent Hesaplanacak olan geri ödeme miktarının içinde bulunduğu nesne
     * @returns Geri ödeme miktarı
     */
    public calculateRefundAmount(rent: Rent): number {
        let diff = this.calculateDiffHours(rent.refundDate, rent.operationDateTime) / 24;
        let refund: number;

        if (diff <= 14) {
            refund = rent.total * 0.75;
        } else if (diff <= 24) {
            let fine = (0.75 - ((diff - 14) * 0.05));
            refund = rent.total * fine;
        }
        else {
            refund = rent.total * 0.25;
        }

        return refund;
    }

    public getRent(rentNumber: string): Rent {
        let rent = this.rentList.find(s => s.operationNumber === rentNumber);
        return rent!;
    }

    public addBookToCart(book: Book, quantity: number, customerId: number) {
        if (this.rentCart.bookAndQuantityMap.size === 0) {
            this.rentCart.customerId = customerId;
        } else if (this.rentCart.bookAndQuantityMap.size > 0) {
            if (this.rentCart.customerId !== customerId) {
                alert("Farklı müşteriye kitap kiralanmaya çalışılıyor. Lütfen tek müşteri için işlem yapınız");
                return false;
            }
        }

        this.rentCart.bookAndQuantityMap.set(book, quantity);
        this.updateRentCart();
    }

    public updateRentCart() {
        const rentCart = document.getElementById("rentCart");
        const subTotalSpan = document.getElementById("totalRentAmountTl");

        if (rentCart) {

            let row, column, subTotal: number = 0;

            while (rentCart.lastChild && rentCart.children.length > 1) {
                rentCart.removeChild(rentCart.lastChild);
            }
            subTotalSpan!.textContent = "";

            for (let index = 0; index < this.rentCart.bookAndQuantityMap.size; index++) {

                row = document.createElement("div");
                row.className = "rent-cart-row";

                for (let entry of this.rentCart.bookAndQuantityMap.entries()) {

                    column = document.createElement("div");
                    column.className = "rent-cart-column";
                    column.textContent = this.rentCart.customerId.toString();
                    row.appendChild(column);

                    column = document.createElement("div");
                    column.className = "rent-cart-column";
                    column.textContent = entry[0].name;
                    row.appendChild(column);

                    column = document.createElement("div");
                    column.className = "rent-cart-column";
                    column.textContent = entry[1].toString();
                    row.appendChild(column);

                    column = document.createElement("div");
                    column.className = "rent-cart-column";
                    column.textContent = (entry[0].bookSpecification.price * entry[1]).toString();
                    row.appendChild(column);
                }
            }

            if (row && subTotalSpan) {

                for (let t of this.rentCart.bookAndQuantityMap) {
                    subTotal += t[0].bookSpecification.price * t[1];
                }

                rentCart.appendChild(row);
                subTotalSpan.textContent = subTotal.toString() + " TL";
            }
        }



    }

    public cartToRent() {
        let rentCart: RentCart = this.rentCart;
        let rent = new Rent();

        rent.bookAndQuantityMap = rentCart.bookAndQuantityMap;
        rent.customerId = rentCart.customerId;
        rent.operationNumber = this.generateRentNumber(rentCart.customerId);
        rent.operationDateTime = new Date();
        rent.total = this.calculateTotal(rent);

        for (let q of rent.bookAndQuantityMap) {
            stockService.increaseStock(q[0].isbn, -q[1])
        }


        this.rentCart = new RentCart; // sepeti boşalt
        this.updateRentCart();

        let success = this.addRentMock(rent);
    }

    async addRentMock(r: Rent): Promise<Boolean | undefined> {
        try {
            const response = await fetch(this.rentApi, {
                method: 'POST',
                body: JSON.stringify({
                    bookAndQuantity: r.bookAndQuantityMap,
                    customerId: r.customerId,
                    operationDateTime: r.operationDateTime,
                    operationNumber: r.operationNumber,
                    total: r.total
                }),
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
            });

            if (response.ok) {
                const result = (await response.json());
                console.log(result);
                alert(result.message + " " + result.saleNumber);
                return true;
            } else {
                throw new Error(`Hata oluştu, hata kodu: ${response.status} `);
            }
        } catch (Exception) {
            console.log('Hata Oluştu.');
        }
    }

    async refundRentMock(r: Rent) {

        //PATCH Belirli bir kaynaktaki verilerin bir kısmının değiştirilmesi için kullanılan metodtur.
        try {
            const response = await fetch(this.rentApi + "/" + r.operationNumber, {
                method: 'PATCH',
                body: JSON.stringify({
                    refundDate: r.refundDate,
                    refund: r.refund
                }),
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
            });

            if (response.ok) {
                const result = (await response.json());
                console.log(result);
                return r.refund;
            } else {
                throw new Error(`Hata oluştu, hata kodu: ${response.status} `);
            }
        } catch (Exception) {
            console.log('Hata Oluştu.');
        }
    }

}