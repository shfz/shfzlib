import axios from "axios";
import { FuzzText } from "../index";

export class Fuzz {
  private shfzUrl: string = "";

  private fuzzTexts: Array<FuzzText>;

  constructor(shfzUrl: string, fuzzTexts: Array<FuzzText>) {
    this.shfzUrl = shfzUrl;
    this.fuzzTexts = fuzzTexts;
  }

  public async gen(
    name: string,
    charset: string,
    maxLen?: number,
    minLen?: number,
    isGenetic?: boolean
  ): Promise<string> {
    let maxLenFixed = 16;
    if (maxLen !== undefined) {
      maxLenFixed = maxLen;
    }
    let minLenFixed = 8;
    if (minLen !== undefined) {
      minLenFixed = minLen;
    }
    let isGeneticFixed = false;
    if (isGenetic !== undefined) {
      isGeneticFixed = isGenetic;
    }
    try {
      const res = await axios.post(`${this.shfzUrl}/fuzz`, {
        name,
        charset,
        maxLen: maxLenFixed,
        minLen: minLenFixed,
        isGenetic: isGeneticFixed,
      });
      if (res.status !== 200) {
        console.error("[-] Failed to get fuzz from shfz server");
        process.exit(1);
      }
      const t = res.data.fuzz;
      const fuzz: FuzzText = { name, text: t };
      this.fuzzTexts.push(fuzz);
      return t;
    } catch (error) {
      console.error("[-] Failed to connect shfz server");
      const len =
        Math.floor(Math.random() * (maxLenFixed - minLenFixed)) + minLenFixed;
      let text = "";
      const l = charset.length;
      for (let i = 0; i < len; i += 1) {
        text += charset[Math.floor(Math.random() * l)];
      }
      console.log("[i] Generate fuzz by shfzlib :", text);
      return text;
    }
  }
}
