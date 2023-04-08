import { cloneDeep } from 'lodash-es';
import type { DeepWritable } from '../types/writable';

/**
 * The same as lodash cloneDeep but the return type is writeable
 */
export const cloneDeepWritable = cloneDeep as <T>(value: T) => DeepWritable<T>;
