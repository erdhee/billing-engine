export class ApplicationError {
  status: number;
  code: string;

  constructor(param: { status: number; code: string }) {
    this.status = param.status;
    this.code = param.code;
  }
}
