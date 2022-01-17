import { Shfzlib, Charset } from "../dist";

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
