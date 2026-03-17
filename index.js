const express = require('express');
const app = express();

app.get('/calculate', (req, res) => {
  const { number } = req.query;
  if (!number) return res.status(400).json({ error: 'Missing number parameter' });
  
  const n = parseInt(number);
  if (isNaN(n) || n < 0) return res.status(400).json({ error: 'Number must be non-negative integer' });
  if (n > 170) return res.status(400).json({ error: 'Number too large (max 170)' });
  
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  
  res.json({ number: n, factorial: result });
});

app.listen(3005, () => console.log('Factorial Calculator API on port 3005'));
