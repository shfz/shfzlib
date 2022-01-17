import axios, { AxiosInstance, AxiosResponse, AxiosRequestConfig } from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import * as lodash from "lodash";
import { v4 as uuidv4 } from "uuid";
import { FuzzText } from "../index";

const _ = lodash;
const querystring = require("querystring");

export class Http {
  private ficliUrl: string = "";

  private client: AxiosInstance;

  private fuzzTexts: Array<FuzzText>; // すでに使用したFuzz

  private id: string; // アプリ側で追跡するためのid x-shfzlib-idヘッダーにセットしてリクエストを送る

  private isError: boolean; // reportErrorでerror()が既に呼ばれたか確認

  constructor(baseURL: string, ficliUrl: string, fuzzTexts: Array<FuzzText>) {
    const jar = new CookieJar();
    this.client = wrapper(
      axios.create({ baseURL, jar, withCredentials: true, timeout: 2000 })
    );
    this.ficliUrl = ficliUrl;
    this.fuzzTexts = fuzzTexts;
    this.id = "";
    this.isError = false;
  }

  // アプリ側で追跡するためにidをx-shfzlib-idヘッダーにセットする
  private setHeaderID(config?: AxiosRequestConfig): AxiosRequestConfig {
    this.id = uuidv4();
    let configFixed = {} as AxiosRequestConfig;
    if (config === undefined) {
      configFixed = {
        headers: { "x-shfzlib-id": this.id },
      };
    } else {
      configFixed = config;
      if (configFixed.headers === undefined) {
        configFixed = {
          headers: { "x-shfzlib-id": this.id },
        };
      } else {
        configFixed.headers["x-shfzlib-id"] = this.id;
      }
    }
    return configFixed;
  }

  // APIのパラメーターのFuzzの情報をficliに送信する setHeaderIDのあとに実行する必要がある
  private async reportFuzz(name: string, url: string, data?: any) {
    try {
      const res = await axios.post(`${this.ficliUrl}/api`, {
        name,
        id: this.id,
        fuzz: Array.from(this.pickupFuzz(url, data).values()),
      });
      if (res.data.result !== "ok") {
        console.error("[-] Failed to send api data to ficli server", res.data);
        process.exit(1);
      }
    } catch (e) {
      console.error("[-] Failed to send api data to ficli server");
      process.exit(1);
    }
  }

  // urlとdataの中で使われているFuzzを取り出す。後でconfigも取り出せるようにする
  private pickupFuzz(url: string, data: any): Set<FuzzText> {
    const res = new Set<FuzzText>();
    const ft = _.cloneDeep(this.fuzzTexts);
    for (let i = 0; i < ft.length; i += 1) {
      if (_.includes(url, ft[i].text)) {
        res.add(ft[i]);
      }
      if (_.includes(data, ft[i].text)) {
        res.add(ft[i]);
      }
    }
    return res;
  }

  private async reportError(error: string) {
    // 既にErrorが発生してreportが完了しているので何も行わない
    if (this.isError) {
      this.isError = false;
      return;
    }
    // iserror用意
    let iserror: boolean = true;
    if (error === "") {
      iserror = false;
    }
    // 初回はthis.idがない状態で呼ばれるので外しておく
    if (this.id !== "") {
      try {
        const res = await axios.post(`${this.ficliUrl}/client/${this.id}`, {
          isClientError: iserror,
          clientError: error,
        });
        if (res.data.result !== "ok") {
          console.error("[-] Failed to send error data to ficli server :", error);
          process.exit(1);
        }
      } catch (e) {
        console.error("[-] Failed to send error data to ficli server :", error);
        process.exit(1);
      }
    }
  }

  public async error(error: string) {
    await this.reportError(error);
    this.isError = true;
  }

  public async done() {
    await this.reportError("");
    process.exit(0);
  }

  // ################################################################
  //  リクエスト処理 (各メソッドごとにwrapperがある)
  // ################################################################

  public async get(
    name: string,
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse> {
    await this.reportError("");
    const configFixed = this.setHeaderID(config);
    await this.reportFuzz(name, url);
    try {
      const res = await this.client.get(url, configFixed);
      return res;
    } catch (error: any) {
      await this.error(`Failed to request. status: ${error.response.status}`);
    }
    process.exit(0);
  }

  public async delete(
    name: string,
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse> {
    await this.reportError("");
    const configFixed = this.setHeaderID(config);
    await this.reportFuzz(name, url);
    try {
      const res = await this.client.delete(url, configFixed);
      return res;
    } catch (error: any) {
      await this.error(`Failed to request. status: ${error.response.status}`);
    }
    process.exit(0);
  }

  public async head(
    name: string,
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse> {
    await this.reportError("");
    const configFixed = this.setHeaderID(config);
    await this.reportFuzz(name, url);
    try {
      const res = await this.client.head(url, configFixed);
      return res;
    } catch (error: any) {
      await this.error(`Failed to request. status: ${error.response.status}`);
    }
    process.exit(0);
  }

  public async options(
    name: string,
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse> {
    await this.reportError("");
    const configFixed = this.setHeaderID(config);
    await this.reportFuzz(name, url);
    try {
      const res = await this.client.options(url, configFixed);
      return res;
    } catch (error: any) {
      await this.error(`Failed to request. status: ${error.response.status}`);
    }
    process.exit(0);
  }

  public async post(
    name: string,
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse> {
    await this.reportError("");
    const configFixed = this.setHeaderID(config);
    await this.reportFuzz(name, url, data);
    try {
      const res = await this.client.post(url, data, configFixed);
      return res;
    } catch (error: any) {
      await this.error(`Failed to request. status: ${error.response.status}`);
    }
    process.exit(0);
  }

  // h.postForm("/post", { username: "abc" });
  public async postForm(
    name: string,
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse> {
    await this.reportError("");
    const configFixed = this.setHeaderID(config);
    await this.reportFuzz(name, url, data);
    try {
      const res = await this.client.post(
        url,
        querystring.stringify(data),
        configFixed
      );
      return res;
    } catch (error: any) {
      await this.error(`Failed to request. status: ${error.response.status}`);
    }
    process.exit(0);
  }

  public async put(
    name: string,
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse> {
    await this.reportError("");
    const configFixed = this.setHeaderID(config);
    await this.reportFuzz(name, url);
    try {
      const res = await this.client.put(url, data, configFixed);
      return res;
    } catch (error: any) {
      await this.error(`Failed to request. status: ${error.response.status}`);
    }
    process.exit(0);
  }

  public async patch(
    name: string,
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse> {
    await this.reportError("");
    const configFixed = this.setHeaderID(config);
    await this.reportFuzz(name, url);
    try {
      const res = await this.client.patch(url, data, configFixed);
      return res;
    } catch (error: any) {
      await this.error(`Failed to request. status: ${error.response.status}`);
    }
    process.exit(0);
  }
}
