import { Body, Controller, Post } from '@nestjs/common';
import { GeneratePayloadDTO } from 'src/dto/generatePayload.dto';
import { OracleService } from 'src/services/oracle.service';

@Controller('/orders')
export class OrderController {
  constructor(private oracleService: OracleService) {}

  @Post()
  async generatePayload(@Body() { id }: GeneratePayloadDTO) {
    const orders = [];

    for (let i = 0; i < id.length; i++) {
      const data = await this.oracleService.getOrder(id[i]);

      const date = new Date(data.paymentGroups[0].submittedDate);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');

      const paymentType = data.paymentGroups[0].paymentMethod;

      if (paymentType === 'cash') {
        const cashObject = {
          pagto_pedido: {
            qt_forma_pgto: '01',
            Pedido_occ: data.id,
            Pedido_sap: data.Pedido_SAP ? data.Pedido_sap : '',
            Valor_pago: data.priceInfo.total,
            Valor_frete: data.priceInfo.shipping,
            Meio_pagto: '07',
            Num_cartao: '',
            NSU_host:
              data.paymentGroups[0].authorizationStatus[0].statusProps
                .pspReferenceId,
            Bandeira: '',
            qt_parcelas: '1',
            Dt_integracao: `${day}/${month}/${year}`,
            Hr_integracao: `${hours}:${minutes}:${seconds}`,
            Dt_pagto: `${day}/${month}/${year}`,
            Hr_pagto: `${hours}:${minutes}:${seconds}`,
          },
        };

        orders.push(cashObject);
      } else if (paymentType === 'creditCard') {
        const cardFlag =
          data.paymentGroups[0].authorizationStatus[0].statusProps.cardFlag.toLowerCase();

        let cardFlagNumber = '';

        if (cardFlag.includes('mastercard')) {
          cardFlagNumber = '0001';
        } else if (cardFlag.includes('visa')) {
          cardFlagNumber = '0002';
        } else if (cardFlag.includes('amex')) {
          cardFlagNumber = '0003';
        } else if (cardFlag.includes('elo')) {
          cardFlagNumber = '0004';
        } else if (cardFlag.includes('hiper')) {
          cardFlagNumber = '0005';
        } else {
          throw new Error(`Invalid cardFlag: ${data.id} - ${cardFlag}`);
        }

        const creditCardObject = {
          pagto_pedido: {
            qt_forma_pgto: '01',
            Pedido_occ: data.id,
            Pedido_sap: data.Pedido_SAP ? data.Pedido_sap : '',
            Valor_pago: data.priceInfo.total,
            Valor_frete: data.priceInfo.shipping,
            Meio_pagto: '02',
            Num_cartao: '',
            NSU_host:
              data.paymentGroups[0].authorizationStatus[0].statusProps.nsuHost,
            Bandeira: `${cardFlagNumber}`,
            qt_parcelas:
              data.paymentGroups[0].authorizationStatus[0].statusProps
                .installments,
            Dt_integracao: `${day}/${month}/${year}`,
            Hr_integracao: `${hours}:${minutes}:${seconds}`,
            Dt_pagto: `${day}/${month}/${year}`,
            Hr_pagto: `${hours}:${minutes}:${seconds}`,
          },
        };
        orders.push(creditCardObject);
      } else if (paymentType === 'invoiceRequest') {
        const invoiceRequestObject = {
          pagto_pedido: {
            qt_forma_pgto: '01',
            Pedido_occ: data.id,
            Pedido_sap: data.Pedido_SAP ? data.Pedido_sap : '',
            Valor_pago: data.priceInfo.total,
            Valor_frete: data.priceInfo.shipping,
            Meio_pagto: '03',
            Num_cartao: '',
            NSU_host:
              data.paymentGroups[0].authorizationStatus[0].statusProps
                .c_billetUuid,
            Bandeira: '',
            qt_parcelas: '1',
            Dt_integracao: `${day}/${month}/${year}`,
            Hr_integracao: `${hours}:${minutes}:${seconds}`,
            Dt_pagto: `${day}/${month}/${year}`,
            Hr_pagto: `${hours}:${minutes}:${seconds}`,
          },
        };

        orders.push(invoiceRequestObject);
      } else {
        throw new Error(
          `Invalid paymentType. ${data.id} - ${data.paymentType}`,
        );
      }
    }

    return orders;
  }
}
