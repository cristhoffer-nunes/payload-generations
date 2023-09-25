import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OracleService {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  async login() {
    const url = this.configService.get('URL_STORE');
    const appKey = this.configService.get('APP_KEY');

    const response = await lastValueFrom(
      this.httpService.post(
        `${url}/ccapp/v1/login`,
        'grant_type=client_credentials',
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Bearer ${appKey}`,
          },
        },
      ),
    );

    if (response.status === 200) {
      return response.data.access_token;
    }
  }

  async getOrder(id: string) {
    const url = this.configService.get('URL_STORE');

    const response = await lastValueFrom(
      this.httpService.get(
        `${url}/ccapp/v1/orders/${id}?fields=id,Pedido_SAP,paymentGroups,priceInfo`,
        {
          headers: {
            Authorization: `Bearer ${await this.login()}`,
          },
        },
      ),
    );

    return response.data;
  }
}
