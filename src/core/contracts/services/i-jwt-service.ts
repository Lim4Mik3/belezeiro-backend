type AssignParams = {
  sub: string;
} & object;

export interface IJWTService {
  assign(params: AssignParams): Promise<string>;

  verify(token: string): Promise<object>;
}
