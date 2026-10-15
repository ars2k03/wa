import { beforeEach, describe, expect, it } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { TemplateService } from '../src/template/template.service.js';

describe('TemplateService', () => {
  let service: TemplateService;

  beforeEach(() => {
    service = new TemplateService({} as any);
  });

  describe('extractVariables', () => {
    it('returns unique names in order of first appearance', () => {
      expect(service.extractVariables('Hi {{name}}, code {{ code }}. Bye {{name}}')).toEqual(['name', 'code']);
    });

    it('ignores malformed placeholders', () => {
      expect(service.extractVariables('{{1abc}} {{ }} {name}')).toEqual([]);
    });
  });

  describe('renderTemplate', () => {
    it('fills every placeholder, including repeats and spaced ones', () => {
      expect(
        service.renderTemplate('Hi {{name}}, your code is {{ code }}. Thanks {{name}}!', { name: 'Arafat', code: 1234 }),
      ).toBe('Hi Arafat, your code is 1234. Thanks Arafat!');
    });

    it('ignores extra values', () => {
      expect(service.renderTemplate('Hello {{name}}', { name: 'A', extra: 'x' })).toBe('Hello A');
    });

    it('does not re-expand placeholders inside values', () => {
      expect(service.renderTemplate('{{a}} {{b}}', { a: '{{b}}', b: 'B' })).toBe('{{b}} B');
    });

    it('lists all missing variables', () => {
      expect(() => service.renderTemplate('{{a}} {{b}} {{c}}', { b: 'ok', c: '  ' })).toThrow(
        new BadRequestException('Missing template variables: a, c'),
      );
    });

    it('rejects non-scalar values', () => {
      expect(() => service.renderTemplate('{{a}}', { a: { nested: true } })).toThrow(BadRequestException);
    });

    it('rejects overly long values', () => {
      expect(() => service.renderTemplate('{{a}}', { a: 'x'.repeat(1025) })).toThrow(BadRequestException);
    });
  });
});
