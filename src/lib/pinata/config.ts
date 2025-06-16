import PinataClient from '@pinata/sdk';

export const pinata = new PinataClient({
  pinataJWTKey: process.env.PINATA_JWT!,
});