import {IFilterConfig} from '../data-source';

/**
 * A filter predicate that implements a case-insensitive string inclusion.
 *
 * @param cellValue the cell value to check
 * @param search the search/filter string to check against
 * @param data ignored
 * @param cellName ignored
 */
export function defaultStringInclusionFilter(cellValue: string, search: string, data: any, cellName: string) {
  /* Implementation note: we declared the parameters as strings, but this does NOT mean they
   * are actually strings because Typescript does NOT check the types. Therefore, we call toString() on the inputs.
   */
  const sanitizedCellValue = cellValue?.toString() ?? '';
  const sanitizedSearchString = search?.toString() ?? '';
  return sanitizedCellValue.toLowerCase().includes(sanitizedSearchString.toLowerCase());
}

/**
 * A filter predicate that implements a case-sensitive equality check.
 *
 * @param cellValue the cell value to check
 * @param search the search/filter string to check against
 * @param data ignored
 * @param cellName ignored
 */
export function defaultStringEqualsFilter(cellValue: string, search: string, data: any, cellName: string) {
  /* Implementation note: we declared the parameters as strings, but this does NOT mean they
   * are actually strings because Typescript does NOT check the types. Therefore, we call toString() on the inputs.
   */
  const sanitizedCellValue = cellValue?.toString() ?? '';
  const sanitizedSearchString = search?.toString() ?? '';
  return sanitizedCellValue === sanitizedSearchString;
}

export class LocalFilter {

  static filter(data: Array<any>, filterConf: IFilterConfig): Array<any> {
    const filter: Function = filterConf.filter ? filterConf.filter : defaultStringInclusionFilter;
    return data.filter((el) => {
      let parts = filterConf.field.split(".");
      let prop = el;
      for (let i = 0; i < parts.length && typeof prop !== 'undefined'; i++) {
        prop = prop[parts[i]];
      }
      return filter.call(null, prop, filterConf.search, data, filterConf.field, el);
    });
  }
}
