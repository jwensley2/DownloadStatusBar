import _ from 'lodash';

/**
 * Force removal of ref properties, unref doesn't seem to work in some cases
 *
 * @param obj
 */
export function forceUnref<T extends object>(obj: T): T {
    return _.omit(_.assign({}, obj), ['_value', '_rawValue', '__v_isRef', '__v_isShallow']) as T;
}