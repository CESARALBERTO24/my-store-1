import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class AmazonService {
  private readonly logger = new Logger(AmazonService.name);
  private readonly accessKey: string;
  private readonly secretKey: string;
  private readonly partnerTag: string;
  private readonly host: string;
  private readonly region: string;

  constructor(private configService: ConfigService) {
    this.accessKey = this.configService.get<string>('AMAZON_ACCESS_KEY');
    this.secretKey = this.configService.get<string>('AMAZON_SECRET_KEY');
    this.partnerTag = this.configService.get<string>('AMAZON_PARTNER_TAG');
    this.host = this.configService.get<string>('AMAZON_HOST', 'webservices.amazon.com');
    this.region = this.configService.get<string>('AMAZON_REGION', 'us-east-1');
  }

  async search(query: string, itemCount: number = 10): Promise<any[]> {
    const payload = {
      Keywords: query,
      Resources: [
        'Images.Primary.Large',
        'ItemInfo.Title',
        'ItemInfo.Features',
        'Offers.Listings.Price',
        'Offers.Listings.Availability.Message',
      ],
      SearchIndex: 'All',
      ItemCount: itemCount,
      PartnerTag: this.partnerTag,
      PartnerType: 'Associates',
      Marketplace: 'www.amazon.com',
    };

    const response = await this.sendRequest('SearchItems', payload);
    return this.formatSearchResults(response?.SearchResult?.Items || []);
  }

  async getById(asin: string): Promise<any> {
    const payload = {
      ItemIds: [asin],
      Resources: [
        'Images.Primary.Large',
        'Images.Variants.Large',
        'ItemInfo.Title',
        'ItemInfo.Features',
        'ItemInfo.ProductInfo',
        'Offers.Listings.Price',
        'Offers.Listings.Availability.Message',
        'Offers.Listings.DeliveryInfo.IsPrimeEligible',
      ],
      PartnerTag: this.partnerTag,
      PartnerType: 'Associates',
      Marketplace: 'www.amazon.com',
    };

    const response = await this.sendRequest('GetItems', payload);
    const items = response?.ItemsResult?.Items || [];
    return items.length > 0 ? this.formatItem(items[0]) : null;
  }

  private formatSearchResults(items: any[]): any[] {
    return items.map((item) => this.formatItem(item));
  }

  private formatItem(item: any): any {
    return {
      source: 'amazon',
      id: item.ASIN,
      title: item.ItemInfo?.Title?.DisplayValue || 'Sin título',
      price: item.Offers?.Listings?.[0]?.Price?.DisplayAmount || null,
      priceValue: item.Offers?.Listings?.[0]?.Price?.Amount || null,
      currency: item.Offers?.Listings?.[0]?.Price?.Currency || 'USD',
      image: item.Images?.Primary?.Large?.URL || null,
      availability: item.Offers?.Listings?.[0]?.Availability?.Message || null,
      isPrime: item.Offers?.Listings?.[0]?.DeliveryInfo?.IsPrimeEligible || false,
      features: item.ItemInfo?.Features?.DisplayValues || [],
      url: `https://www.amazon.com/dp/${item.ASIN}?tag=${this.partnerTag}`,
      asin: item.ASIN,
    };
  }

  private async sendRequest(operation: string, payload: any): Promise<any> {
    const path = '/paapi5/' + operation.toLowerCase();
    const timestamp = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
    const date = timestamp.substring(0, 8);

    const bodyString = JSON.stringify(payload);
    const headers: any = {
      'content-encoding': 'amz-1.0',
      'content-type': 'application/json; charset=utf-8',
      host: this.host,
      'x-amz-date': timestamp,
      'x-amz-target': `com.amazon.paapi5.v1.ProductAdvertisingAPIv1.${operation}`,
    };

    headers['Authorization'] = this.sign(date, timestamp, path, headers, bodyString);

    try {
      const response = await axios.post(
        `https://${this.host}${path}`,
        bodyString,
        { headers },
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Amazon API error: ${error.message}`);
      throw error;
    }
  }

  private sign(
    date: string,
    timestamp: string,
    path: string,
    headers: any,
    body: string,
  ): string {
    const service = 'ProductAdvertisingAPI';

    const canonicalHeaders =
      Object.keys(headers)
        .sort()
        .map((k) => `${k}:${headers[k]}`)
        .join('\n') + '\n';

    const signedHeaders = Object.keys(headers).sort().join(';');

    const payloadHash = crypto.createHash('sha256').update(body).digest('hex');

    const canonicalRequest = [
      'POST', path, '', canonicalHeaders, signedHeaders, payloadHash,
    ].join('\n');

    const credentialScope = `${date}/${this.region}/${service}/aws4_request`;

    const stringToSign = [
      'AWS4-HMAC-SHA256',
      timestamp,
      credentialScope,
      crypto.createHash('sha256').update(canonicalRequest).digest('hex'),
    ].join('\n');

    const signingKey = this.getSigningKey(date, service);
    const signature = crypto
      .createHmac('sha256', signingKey)
      .update(stringToSign)
      .digest('hex');

    return `AWS4-HMAC-SHA256 Credential=${this.accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  }

  private getSigningKey(date: string, service: string): Buffer {
    const kDate = crypto.createHmac('sha256', `AWS4${this.secretKey}`).update(date).digest();
    const kRegion = crypto.createHmac('sha256', kDate).update(this.region).digest();
    const kService = crypto.createHmac('sha256', kRegion).update(service).digest();
    return crypto.createHmac('sha256', kService).update('aws4_request').digest();
  }
}
