import {afterEach, describe, expect, it, vi} from 'vitest';

import * as factories from '#/factories';
import prisma from '~/db.server';
import {paginate} from '../paginate';

const TEST_SHOP_PREFIX = 'paginate-test';

describe('paginate', () => {
  afterEach(async () => {
    await prisma.billingSchedule.deleteMany({
      where: {shop: {startsWith: TEST_SHOP_PREFIX}},
    });
  });

  describe('with multiple pages', () => {
    it('pages through all results', async () => {
      await factories.billingSchedule.create({
        shop: `${TEST_SHOP_PREFIX}-1.myshopify.com`,
        active: true,
      });
      await factories.billingSchedule.create({
        shop: `${TEST_SHOP_PREFIX}-2.myshopify.com`,
        active: true,
      });
      await factories.billingSchedule.create({
        shop: `${TEST_SHOP_PREFIX}-3.myshopify.com`,
        active: true,
      });

      const count = await prisma.billingSchedule.count({
        where: {shop: {startsWith: TEST_SHOP_PREFIX}},
      });
      expect(count).toEqual(3);

      const callback = vi.fn();

      await paginate(
        {
          where: {shop: {startsWith: TEST_SHOP_PREFIX}},
          take: 2,
          orderBy: {shop: 'asc'},
        },
        callback,
      );

      expect(callback).toHaveBeenCalledTimes(2);

      expect(callback).toHaveBeenCalledWith([
        expect.objectContaining({
          active: true,
          hour: 10,
          timezone: 'America/Toronto',
          shop: `${TEST_SHOP_PREFIX}-1.myshopify.com`,
        }),
        expect.objectContaining({
          active: true,
          hour: 10,
          timezone: 'America/Toronto',
          shop: `${TEST_SHOP_PREFIX}-2.myshopify.com`,
        }),
      ]);

      expect(callback).toHaveBeenCalledWith([
        expect.objectContaining({
          active: true,
          hour: 10,
          timezone: 'America/Toronto',
          shop: `${TEST_SHOP_PREFIX}-3.myshopify.com`,
        }),
      ]);
    });

    it('pages through filtered results', async () => {
      await factories.billingSchedule.create({
        shop: `${TEST_SHOP_PREFIX}-active-1.myshopify.com`,
        active: true,
      });
      await factories.billingSchedule.create({
        shop: `${TEST_SHOP_PREFIX}-inactive.myshopify.com`,
        active: false,
      });
      await factories.billingSchedule.create({
        shop: `${TEST_SHOP_PREFIX}-active-2.myshopify.com`,
        active: true,
      });

      const count = await prisma.billingSchedule.count({
        where: {shop: {startsWith: TEST_SHOP_PREFIX}},
      });
      expect(count).toEqual(3);

      const callback = vi.fn();

      await paginate(
        {
          where: {active: true, shop: {startsWith: TEST_SHOP_PREFIX}},
          take: 1,
        },
        callback,
      );

      expect(callback).toHaveBeenCalledTimes(2);

      expect(callback).toHaveBeenCalledWith([
        expect.objectContaining({
          active: true,
          hour: 10,
          timezone: 'America/Toronto',
          shop: `${TEST_SHOP_PREFIX}-active-1.myshopify.com`,
        }),
      ]);

      expect(callback).toHaveBeenCalledWith([
        expect.objectContaining({
          active: true,
          hour: 10,
          timezone: 'America/Toronto',
          shop: `${TEST_SHOP_PREFIX}-active-2.myshopify.com`,
        }),
      ]);
    });
  });
});
