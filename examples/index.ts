import { Shfzlib, Charset } from "../dist";

const fi = new Shfzlib("http://localhost:8080");

(async () => {
  const param0 = await fi.fuzz.gen("param0", Charset.lowercase(), 8, 4, true);
  const res = await fi.http.postForm("POST /test", "/test", { param: param0 });
  console.log(res.data);
  await fi.http.done();
})();
