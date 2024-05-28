import {Column} from './column';
import {DataSet} from './data-set';
import {Row} from './row';

export function prepareValue (value: any) { return value }

export class Cell {

  newValue: any = '';
  protected static PREPARE = prepareValue;

  constructor(protected value: any, protected row: Row, protected column: any, protected dataSet: DataSet) {
    this.newValue = value;
  }

  getColumn(): Column {
    return this.column;
  }

  getRow(): Row {
    return this.row;
  }

  /**
   * Gets the value (after post-processing with valuePrepareFunction).
   */
  getValue(): any {
    const valid = this.column.getValuePrepareFunction() instanceof Function;
    const prepare = valid ? this.column.getValuePrepareFunction() : Cell.PREPARE;
    return prepare.call(null, this.value, this.row.getData(), this);
  }

  /**
   * Returns the raw value that has not been post-processed by the valuePrepareFunction.
   */
  getRawValue(): any {
    return this.value;
  }

  setValue(value: any): any {
    this.newValue = value;
  }

  getId(): string {
    return this.getColumn().id;
  }

  getTitle(): string {
    return this.getColumn().title;
  }

  isEditable(): boolean {
    if (this.getRow().index === -1) {
      return this.getColumn().isAddable ?? false;
    }
    else {
      return this.getColumn().isEditable ?? false;
    }
  }

  resetValue(): void {
    this.newValue = this.getRawValue();
  }
}
