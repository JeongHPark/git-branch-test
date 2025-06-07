import app from "./index";

const port = 8080;
app.listen(port, () => {
  console.log(`Auth service running at http://localhost:${port}`);
});
