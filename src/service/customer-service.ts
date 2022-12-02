import { Customer } from "../domain/customer";

const CUSTOMER_API: string = "http://localhost:3002/api/v1/customers";

export class CustomerService {
    private _customerList: Array<Customer>;

    constructor(customerList: Array<Customer>) {
        this._customerList = customerList;
    }

    /**
     * Getter customerList
     * @return {Array<Customer>}
     */
    public get customerList(): Array<Customer> {
        return this._customerList;
    }

    /**
     * Setter customerList
     * @param {Array<Customer>} value
     */
    public set customerList(value: Array<Customer>) {
        this._customerList = value;
    }

    public async getAllCustomersData(): Promise<Array<Customer>> {
        const response = await fetch(CUSTOMER_API, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`Hata oluştu, hata kodu: ${response.status} `);
        }
        const result = (await response.json());
        const getResult = <Array<Customer>>result;
        return getResult;
    }

    public async createCustomer(newCustomer: Customer) {
        try {
            const response = await fetch(CUSTOMER_API, {
                method: 'POST',
                body: JSON.stringify({
                    name: newCustomer.name,
                    surName: newCustomer.surName,
                    phoneNumber: newCustomer.phoneNumber
                }),
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
            });

            if (response.ok) {
                const result = (await response.json());
                console.log("Rest servisinden dönen cevap =>");
                console.log(result);
                return true;
            } else {
                throw new Error(`Hata oluştu, hata kodu: ${response.status} `);
            }
        } catch (Exception) {
            console.log('Hata Oluştu.');
        }
    }

    public async getCustomer(customerId: number): Promise<Customer> {
        const response = await fetch(CUSTOMER_API + "/" + customerId, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`Aranan müşteri bulunamadı, hata kodu:, ${response.status}`);
        }

        const result = (await response.json());
        const getResult = <Customer>result;
        return getResult;
    }
}