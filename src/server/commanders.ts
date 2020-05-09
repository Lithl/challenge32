import express from 'express';
import request from 'request-promise-native';
import 'colors';

export type ManaColor = 'W' | 'U' | 'B' | 'R' | 'G';

export interface CardData {
  id: string;
  name: string;
  colorIdentity: ManaColor[];
  partnerWith?: string;
  partnerWithAny: boolean;
  image: {
    normal: string,
    art: string,
  };
}

export const whitelistedRoutes: string[] = [];

export function apply(app: express.Application) {
  let commanders: CardData[] = [];

  function createRoute(route: string, cb: express.RequestHandler) {
    whitelistedRoutes.push(route);
    app.get(route, cb);
  }

  function timer(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function getCardData(uri?: string) {
    console.info(`called getCardData(${(uri || '').blue})`.italic);
    const queryStr = 'is:commander';
    return request(uri || `https://api.scryfall.com/cards/search?q=${queryStr}`)
      .then(async (text: string) => {
        const json = JSON.parse(text);
        json.data.forEach((orig: any) => {
          let partnerWith;
          let partnerWithAny;
          if (orig.card_faces && orig.card_faces[0].oracle_text) {
            partnerWith = (orig.card_faces[0].oracle_text.match(/^partner with ([^(\n]+)/im) || '')[1];
            partnerWithAny = /^partner\b/im.test(orig.card_faces[0].oracle_text) && !partnerWith;
          } else {
            partnerWith = (orig.oracle_text.match(/^partner with ([^(\n]+)/im) || '')[1];
            partnerWithAny = /^partner\b/im.test(orig.oracle_text) && !partnerWith;
          }
          if (partnerWith) partnerWith = partnerWith.trim();

          if (orig.card_faces && orig.card_faces[0].image_uris) {
            commanders.push({
              id: orig.id,
              name: orig.card_faces[0].name,
              colorIdentity: orig.color_identity,
              partnerWith,
              partnerWithAny,
              image: {
                normal: orig.card_faces[0].image_uris.normal,
                art: orig.card_faces[0].image_uris.art_crop,
              },
            });
          } else {
            commanders.push({
              id: orig.id,
              name: orig.name,
              colorIdentity: orig.color_identity,
              partnerWith,
              partnerWithAny,
              image: {
                normal: orig.image_uris.normal,
                art: orig.image_uris.art_crop,
              },
            });
          }
        });

        if (json.next_page) {
          await timer(1000);
          await getCardData(json.next_page);
        }
      }).catch((err: any) => console.error(err));
  }

  function populateCommanders() {
    console.info('calling populateCommanders'.italic);
    return getCardData();
  }
  populateCommanders().catch((err: string) => {
    console.error(err);
  });

  createRoute('/commanders', (_: express.Request, res: express.Response) => {
    if (!commanders.length) {
      populateCommanders().then(() => {
        res.status(200).send({ commanders });
      }).catch((err: string) => {
        res.status(500).send(err);
      });
    } else {
      res.status(200).send({ commanders });
    }
  });

  createRoute('/repopulate-commanders', (_: express.Request, res: express.Response) => {
    commanders = [];
    populateCommanders().finally(() => {
      res.status(200).send({
        updating: true,
        message: 'A full update has begun. This may take several minutes.',
      });
    });
  });
}
