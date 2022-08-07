// a generic class for general purpose result object type.
export class QueryArrayResult<T> {
  constructor(public messages?: Array<string>, public entities?: Array<T>) {}
}
