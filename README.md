# shfzlib

Scenario-based fuzzing test execution tool's scenario library.

## Install

<https://www.npmjs.com/package/shfzlib>

```
npm i shfzlib
```

## Setup

Installation of `Node.js`, `npm` and [shfz/shfz](https://github.com/shfz/shfz) is required.

### TypeScript

Setup npm project

```
$ mkdir fuzz-project
$ cd fuzz-project
$ npm init
$ npm install typescript @types/node shfzlib
```

```
$ touch tsconfig.json
```
```ts
{
  "compilerOptions": {
    "target": "esnext",
    "module": "commonjs",
    "moduleResolution": "node",
    "strict": true,
    "skipLibCheck": true,
    "declaration": true,
    "pretty": true,
    "newLine": "lf",
    "outDir": "dist"
  },
  "exclude": [
    "node_modules"
  ]
}
```

Edit fuzzing scenario script. (For this scenario, fuzz [shfz/demo-webapp](https://github.com/shfz/demo-webapp) running in your local environment.)

```
$ touch scenario.ts
```
```ts
import { Shfzlib, Charset } from "shfzlib";

const sh = new Shfzlib("http://localhost");

(async () => {
  const username = await sh.fuzz.gen("username", Charset.lowercase(), 12, 8, false);
  const password = await sh.fuzz.gen("password", Charset.ascii(), 16, 8, false);

  await sh.http.postForm("POST /register", "/register", { username, password });
  await sh.http.postForm("POST /login", "/login", { username, password });

  const title = await sh.fuzz.gen("title", Charset.lowercase(), 16, 8, false);
  const text = await sh.fuzz.gen("text", Charset.ascii(), 16, 8, false);

  await sh.http.postForm("POST /memo", "/memo", { title, text });

  await sh.http.done();
})();
```

Run [shfz/demo-webapp](https://github.com/shfz/demo-webapp) and shfz server, then execute scenario script by `shfz run`.

```
$ cd demo-webapp
$ docker-compose up

$ shfz server
```
```
$ ./node_modules/.bin/tsc scenario.ts
$ shfz run -f scenario.js -n 10 -p 1 -t 30
```

## Usage

### Initialize

```ts
import { Shfzlib, Charset } from "shfzlib";
```

`Shfzlib` contains http request function and fuzz generate function. `char` contains some typical character sets.

```ts
const sh = new Shfzlib("http://localhost");
```

Create an instance of `Shfzlib`. The argument is baseURL of the web application to be fuzzng.

The session information for a series of http requests is stored in the AxiosInstance. (The cookie is held by [axios-cookiejar-support](https://www.npmjs.com/package/axios-cookiejar-support))

### fuzz generate `fl.fuzz`

```ts
sh.fuzz.gen("username", Charset.lowercase(), 12, 8, false);
```
> `gen(name: string, charset: string, maxLen?: number, minLen?: number, isGenetic?: boolean): Promise<string>;`

### http request `sh.http`

This library is an extension of axios, and in many cases allows you to add the same options as in axios. Please refer TypeScript type information for details.

Note : In this script, async/await is used. These http requests need to be wrapped with async.

#### GET

```ts
sh.http.get("API Name", "/path");
```
> `get(name: string, url: string, config?: AxiosRequestConfig): Promise<AxiosResponse>;`

#### POST (json)

```ts
sh.http.post("API Name", "/path", { "param": param });
```
> `post(name: string, url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse>;`

#### POST (form)

```ts
sh.http.postForm("API Name", "/path", { "param": param });
```
> `postForm(name: string, url: string, data?: any, config?: AxiosRequestConfig):` Promise<AxiosResponse>;

#### PUT

```ts
sh.http.put("API Name", "/path", { "param": param });
```
> `put(name: string, url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse>;`

#### PATCH

```ts
sh.http.patch("API Name", "/path", { "param": param });
```
> `patch(name: string, url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse>;`

#### DELETE

```ts
sh.http.delete("API Name", "/path");
```
> `delete(name: string, url: string, config?: AxiosRequestConfig): Promise<AxiosResponse>;`

#### HEAD

```ts
sh.http.head("API Name", "/path");
```
> `head(name: string, url: string, config?: AxiosRequestConfig): Promise<AxiosResponse>;`

#### OPTIONS

```ts
sh.http.options("API Name", "/path");
```
> `options(name: string, url: string, config?: AxiosRequestConfig): Promise<AxiosResponse>;`

### Charset

- `Charset.ascii()` : `!"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_'abcdefghijklmnopqrstuvwxyz{|}~`
- `Charset.symbol()` : `!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~`
- `Charset.number()` : `0123456789`
- `Charset.lowercase()` : `abcdefghijklmnopqrstuvwxyz`
- `Charset.uppercase()` : `ABCDEFGHIJKLMNOPQRSTUVWXYZ`
