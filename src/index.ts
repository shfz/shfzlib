import { Http } from "./lib/http";
import { Fuzz } from "./lib/fuzz";

// 取得したFuzzを保持してReportに使用する
export interface FuzzText {
  name: string;
  text: string;
}

export class Shfzlib {
  public http: Http;

  public fuzz: Fuzz;

  private fuzzTexts: Array<FuzzText>;

  constructor(appUrl: string, ficliUrl?: string) {
    this.fuzzTexts = [];


    const ficliUrlFixed = ficliUrl ?? "http://localhost:53653";
    this.http = new Http(appUrl, ficliUrlFixed, this.fuzzTexts);
    this.fuzz = new Fuzz(ficliUrlFixed, this.fuzzTexts);
  }
}
