import { BaseApiException } from 'src/common/exceptions';

export class FoodNotFoundException extends BaseApiException {
  constructor() {
    super({ message: 'Food not found', status: 404 });
  }
}

export class FoodOutStockException extends BaseApiException {
  constructor() {
    super({ message: 'Food is out of stock' });
  }
}
