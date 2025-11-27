import Decimal from "decimal.js";

export default class CompanyPayment {
  id: string = "";
  provider: string = "";
  provider_payment_id: string = "";
  status: string = "";
  currency: string = "BRL";
  amount: Decimal = new Decimal(0);
  months: number = 1;
  paid_at?: string;
  external_reference?: string;

  constructor(data: Partial<CompanyPayment> = {}) {
    Object.assign(this, data);
    this.amount = new Decimal(data.amount ?? 0);
  }
}
