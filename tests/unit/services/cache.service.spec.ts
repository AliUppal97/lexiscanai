/**
 * Cache Service Unit Tests
 * 
 * Tests Redis caching functionality:
 * - Get/Set/Delete operations
 * - TTL management
 * - Cache-aside pattern (remember)
 * - Data structures (sets, hashes, lists)
 */

import { CacheService } from '../../../apps/api/src/services/cache.service';

describe('CacheService', () => {
  let service: CacheService;

  beforeEach(async () => {
    service = new CacheService();
    await service.flush(); // Clear cache before each test
  });

  afterAll(async () => {
    await service.disconnect();
  });

  describe('Basic Operations', () => {
    it('should set and get a value', async () => {
      await service.set('test-key', 'test-value');
      const value = await service.get('test-key');

      expect(value).toBe('test-value');
    });

    it('should return null for non-existent key', async () => {
      const value = await service.get('non-existent-key');

      expect(value).toBeNull();
    });

    it('should delete a key', async () => {
      await service.set('delete-key', 'value');
      await service.del('delete-key');

      const value = await service.get('delete-key');
      expect(value).toBeNull();
    });

    it('should check if key exists', async () => {
      await service.set('exists-key', 'value');

      const exists = await service.exists('exists-key');
      const notExists = await service.exists('not-exists-key');

      expect(exists).toBe(true);
      expect(notExists).toBe(false);
    });

    it('should flush all keys', async () => {
      await service.set('key1', 'value1');
      await service.set('key2', 'value2');

      await service.flush();

      const value1 = await service.get('key1');
      const value2 = await service.get('key2');

      expect(value1).toBeNull();
      expect(value2).toBeNull();
    });
  });

  describe('TTL Management', () => {
    it('should set key with TTL', async () => {
      await service.setWithTTL('ttl-key', 'value', 2); // 2 seconds

      const value = await service.get('ttl-key');
      expect(value).toBe('value');

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 3000));

      const expiredValue = await service.get('ttl-key');
      expect(expiredValue).toBeNull();
    }, 5000);

    it('should get remaining TTL', async () => {
      await service.setWithTTL('ttl-key', 'value', 10);

      const ttl = await service.ttl('ttl-key');

      expect(ttl).toBeGreaterThan(5);
      expect(ttl).toBeLessThanOrEqual(10);
    });

    it('should update TTL of existing key', async () => {
      await service.set('key', 'value');
      await service.expire('key', 5);

      const ttl = await service.ttl('key');

      expect(ttl).toBeGreaterThan(0);
      expect(ttl).toBeLessThanOrEqual(5);
    });

    it('should return -1 for key without TTL', async () => {
      await service.set('persistent-key', 'value');

      const ttl = await service.ttl('persistent-key');

      expect(ttl).toBe(-1);
    });
  });

  describe('Cache-Aside Pattern', () => {
    it('should remember value from function', async () => {
      let callCount = 0;
      const fn = jest.fn(async () => {
        callCount++;
        return 'computed-value';
      });

      // First call should execute function
      const value1 = await service.remember('remember-key', 60, fn);
      expect(value1).toBe('computed-value');
      expect(callCount).toBe(1);

      // Second call should use cache
      const value2 = await service.remember('remember-key', 60, fn);
      expect(value2).toBe('computed-value');
      expect(callCount).toBe(1); // Function not called again
    });

    it('should re-execute function after cache expires', async () => {
      let callCount = 0;
      const fn = jest.fn(async () => {
        callCount++;
        return 'computed-value';
      });

      await service.remember('expire-key', 1, fn); // 1 second TTL
      expect(callCount).toBe(1);

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 2000));

      await service.remember('expire-key', 1, fn);
      expect(callCount).toBe(2); // Function called again
    }, 4000);
  });

  describe('Object Storage', () => {
    it('should store and retrieve objects', async () => {
      const obj = { name: 'John', age: 30, email: 'john@example.com' };

      await service.set('user-obj', obj);
      const retrieved = await service.get('user-obj');

      expect(retrieved).toEqual(obj);
    });

    it('should handle arrays', async () => {
      const arr = [1, 2, 3, 4, 5];

      await service.set('array', arr);
      const retrieved = await service.get('array');

      expect(retrieved).toEqual(arr);
    });

    it('should handle nested objects', async () => {
      const nested = {
        user: {
          profile: {
            name: 'John',
            address: {
              city: 'New York',
              country: 'USA',
            },
          },
        },
      };

      await service.set('nested', nested);
      const retrieved = await service.get('nested');

      expect(retrieved).toEqual(nested);
    });
  });

  describe('Sets', () => {
    it('should add members to a set', async () => {
      await service.sAdd('tags', 'javascript');
      await service.sAdd('tags', 'typescript');
      await service.sAdd('tags', 'nodejs');

      const members = await service.sMembers('tags');

      expect(members).toContain('javascript');
      expect(members).toContain('typescript');
      expect(members).toContain('nodejs');
      expect(members.length).toBe(3);
    });

    it('should not add duplicate members', async () => {
      await service.sAdd('tags', 'javascript');
      await service.sAdd('tags', 'javascript');

      const members = await service.sMembers('tags');

      expect(members.length).toBe(1);
    });

    it('should remove member from set', async () => {
      await service.sAdd('tags', 'javascript');
      await service.sAdd('tags', 'typescript');

      await service.sRem('tags', 'javascript');

      const members = await service.sMembers('tags');

      expect(members).not.toContain('javascript');
      expect(members).toContain('typescript');
    });

    it('should check if member exists in set', async () => {
      await service.sAdd('tags', 'javascript');

      const exists = await service.sIsMember('tags', 'javascript');
      const notExists = await service.sIsMember('tags', 'python');

      expect(exists).toBe(true);
      expect(notExists).toBe(false);
    });
  });

  describe('Hashes', () => {
    it('should set and get hash fields', async () => {
      await service.hSet('user:123', 'name', 'John');
      await service.hSet('user:123', 'age', '30');

      const name = await service.hGet('user:123', 'name');
      const age = await service.hGet('user:123', 'age');

      expect(name).toBe('John');
      expect(age).toBe('30');
    });

    it('should set multiple hash fields at once', async () => {
      await service.hMSet('user:456', {
        name: 'Jane',
        age: '25',
        email: 'jane@example.com',
      });

      const name = await service.hGet('user:456', 'name');
      const email = await service.hGet('user:456', 'email');

      expect(name).toBe('Jane');
      expect(email).toBe('jane@example.com');
    });

    it('should get all hash fields', async () => {
      await service.hMSet('user:789', {
        name: 'Bob',
        age: '35',
        city: 'NY',
      });

      const all = await service.hGetAll('user:789');

      expect(all).toEqual({
        name: 'Bob',
        age: '35',
        city: 'NY',
      });
    });

    it('should delete hash field', async () => {
      await service.hSet('user:999', 'name', 'Test');
      await service.hSet('user:999', 'age', '20');

      await service.hDel('user:999', 'age');

      const age = await service.hGet('user:999', 'age');
      const name = await service.hGet('user:999', 'name');

      expect(age).toBeNull();
      expect(name).toBe('Test');
    });
  });

  describe('Lists', () => {
    it('should push items to list', async () => {
      await service.lPush('queue', 'item1');
      await service.lPush('queue', 'item2');
      await service.lPush('queue', 'item3');

      const length = await service.lLen('queue');

      expect(length).toBe(3);
    });

    it('should pop items from list', async () => {
      await service.lPush('queue', 'item1');
      await service.lPush('queue', 'item2');

      const item = await service.lPop('queue');

      expect(item).toBe('item2'); // LIFO
    });

    it('should get list range', async () => {
      await service.rPush('list', 'a');
      await service.rPush('list', 'b');
      await service.rPush('list', 'c');

      const range = await service.lRange('list', 0, -1);

      expect(range).toEqual(['a', 'b', 'c']);
    });

    it('should trim list', async () => {
      await service.rPush('list', '1');
      await service.rPush('list', '2');
      await service.rPush('list', '3');
      await service.rPush('list', '4');

      await service.lTrim('list', 0, 1); // Keep first 2 items

      const range = await service.lRange('list', 0, -1);

      expect(range).toEqual(['1', '2']);
    });
  });

  describe('Patterns', () => {
    it('should get keys by pattern', async () => {
      await service.set('user:1', 'value1');
      await service.set('user:2', 'value2');
      await service.set('post:1', 'value3');

      const userKeys = await service.keys('user:*');

      expect(userKeys).toContain('user:1');
      expect(userKeys).toContain('user:2');
      expect(userKeys).not.toContain('post:1');
    });

    it('should delete keys by pattern', async () => {
      await service.set('temp:1', 'value1');
      await service.set('temp:2', 'value2');
      await service.set('keep:1', 'value3');

      await service.deletePattern('temp:*');

      const temp1 = await service.get('temp:1');
      const keep1 = await service.get('keep:1');

      expect(temp1).toBeNull();
      expect(keep1).toBe('value3');
    });
  });

  describe('Atomic Operations', () => {
    it('should increment value', async () => {
      await service.incr('counter');
      await service.incr('counter');
      await service.incr('counter');

      const value = await service.get('counter');

      expect(value).toBe('3');
    });

    it('should increment by amount', async () => {
      await service.incrBy('counter', 10);
      await service.incrBy('counter', 5);

      const value = await service.get('counter');

      expect(value).toBe('15');
    });

    it('should decrement value', async () => {
      await service.set('counter', '10');
      await service.decr('counter');
      await service.decr('counter');

      const value = await service.get('counter');

      expect(value).toBe('8');
    });
  });

  describe('Error Handling', () => {
    it('should handle connection errors', async () => {
      const invalidService = new CacheService({
        host: 'invalid-host',
        port: 9999,
      });

      await expect(invalidService.get('key')).rejects.toThrow();
    });

    it('should handle invalid data types', async () => {
      await service.set('key', 'value');

      // Trying to use list operations on a string key should fail
      await expect(service.lPush('key', 'item')).rejects.toThrow();
    });
  });

  describe('Performance', () => {
    it('should handle concurrent operations', async () => {
      const operations = Array.from({ length: 100 }, (_, i) =>
        service.set(`concurrent-key-${i}`, `value-${i}`)
      );

      await Promise.all(operations);

      const value = await service.get('concurrent-key-50');
      expect(value).toBe('value-50');
    });

    it('should be fast for simple operations', async () => {
      const startTime = Date.now();

      for (let i = 0; i < 1000; i++) {
        await service.set(`perf-key-${i}`, `value-${i}`);
      }

      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    }, 10000);
  });
});

