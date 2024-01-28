import express, { Request, Response, Application } from "express";
import cors from "cors";
import bcrypt from "bcrypt";

const app: Application = express();
const port = 8000;

const saltRounds = 10;

app.use(cors());
app.use(express.json());

app.post("/api/hash", async (req: Request, res: Response) => {
  const { password } = req.body;

  console.log(password);

  const cryptPass = await bcrypt.hash(password, saltRounds);

  res.status(200).json({ password: cryptPass });
});

app.post("/api/verify", async (req: Request, res: Response) => {
  const { userInput, hash } = req.body;

  const isValid = await bcrypt.compare(userInput, hash);

  res.status(200).json({ isValid });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
