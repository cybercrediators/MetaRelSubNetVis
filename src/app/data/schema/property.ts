import { PropertyTypeEnum } from '../../core/enum/property-type-enum';
import { PropertyMapping } from './property-mapping';
import { PropertyScopeEnum } from '../../core/enum/property-scope.enum';

export interface Property {
  name: string;
  label: string;
  threshold: boolean;
  type: PropertyTypeEnum;
  mapping: PropertyMapping;
  min?: number;
  max?: number;
  minA?: number;
  minB?: number;
  maxA?: number;
  maxB?: number;
}
