import express from 'express';
import authRouter from './routes/auth';
import { verifyAccessToken } from './verifyAccessToken'

const app = express();
app.use(express.json());

app.use('/auth', authRouter);

app.listen(3000, () => {
  console.log('Server running on port 3000');
});

app.get('/protected', verifyAccessToken, (req, res) => {
  res.json({ message: 'You are authorized ✅' });
});

