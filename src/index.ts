import { Http } from "./lib/http";
import { Fuzz } from "./lib/fuzz";
import * as libchar from "./lib/char";

export const Charset = libchar;

// 取得したFuzzを保持してReportに使用する
export interface FuzzText {
  name: string;
  text: string;
}

export class Shfzlib {
  public http: Http;

  public fuzz: Fuzz;

  private fuzzTexts: Array<FuzzText>;

  constructor(appUrl: string, shfzUrl?: string) {
    this.fuzzTexts = [];


    const shfzUrlFixed = shfzUrl ?? "http://localhost:53653";
    this.http = new Http(appUrl, shfzUrlFixed, this.fuzzTexts);
    this.fuzz = new Fuzz(shfzUrlFixed, this.fuzzTexts);
  }
}
