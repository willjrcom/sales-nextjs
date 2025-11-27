export default class SubscriptionSettings {
  monthly_price: number = 0;
  currency: string = "BRL";
  min_months: number = 1;
  max_months: number = 12;
  default_months: number = 1;

  constructor(data: Partial<SubscriptionSettings> = {}) {
    Object.assign(this, data);
  }
}
