const Knex = require('knex');

const defaultConfig = {
  dialect: 'sqlite3',
  useNullAsDefault: true,
  connection: {
    filename: './db.sqlite3',
  },
};

module.exports = class SQLStrategy {
  constructor(config) {
    if (!config) {
      console.error('SQLStrategy: empty config provided');
    } else {
      console.log(`Debug: ${config.dialect}.`);
      try {
        this.knex = Knex(config);
      } catch (e) {
        console.error(`KnexError: ${e}`);
      }
    }
  }

  initialize() {
    if (!this.knex) {
      console.error('SQLStrategy: knex is undefined!');
      return false;
    }

    knex.schema.hasTable('shops').then((exists) => {
      if (!exists) {
        return this.knex.schema.createTable('shops', t => {
          t.increments('id');
          t.string('shopify_domain');
          t.string('access_token');
          t.unique('shopify_domain');
        });
      }
    });
  }

  async storeShop({ shop, accessToken }) {
    const result = await this.knex.raw(
      `SELECT access_token FROM shops WHERE shopify_domain='${shop}';`
    );

    if (!result.length) {
      await this.knex.raw(
        `INSERT INTO shops (shopify_domain, access_token) VALUES ('${shop}', '${accessToken}');`
      );
    }

    return {accessToken};
  }

  getShop({ shop }) {
    return this.knex('shops').where('shopify_domain', shop)
  }
};
