import express from 'express';
import request from 'request-promise-native';

export type ManaColor = 'W' | 'U' | 'B' | 'R' | 'G';

export interface CardData {
  name: string;
  colorIdentity: ManaColor[];
  image: {
    normal: string,
    art: string,
  };
}

export function apply(app: express.Application) {
  let commanders: CardData[] = [];

  function timer(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function getCardData(uri?: string) {
    console.info(`called getCardData(${uri})`);
    const queryStr = 'is:commander';
    return request(uri || `https://api.scryfall.com/cards/search?q=${queryStr}`)
      .then(async (text: string) => {
        const json = JSON.parse(text);
        json.data.forEach((orig: any) => {
          if (orig.card_faces && orig.card_faces[0].image_uris) {
            commanders.push({
              name: orig.card_faces[0].name,
              colorIdentity: orig.color_identity,
              image: {
                normal: orig.card_faces[0].image_uris.normal,
                art: orig.card_faces[0].image_uris.art_crop,
              },
            });
          } else {
            commanders.push({
              name: orig.name,
              colorIdentity: orig.color_identity,
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
      });
  }

  function populateCommanders() {
    console.info('calling populateKeywords');
    return getCardData();
  }
  populateCommanders().catch((err: string) => {
    console.error(err);
  });

  app.get('/commanders', (_: express.Request, res: express.Response) => {
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

  app.get('/repopulate-commanders', (_: express.Request, res: express.Response) => {
    commanders = [];
    populateCommanders().finally(() => {
      res.status(200).send({
        updating: true,
        message: 'A full update has begun. This may take several minutes.',
      });
    });
  });
}
