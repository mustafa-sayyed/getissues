import express from "express";

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.get("/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
