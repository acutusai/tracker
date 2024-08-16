const express = require('express');
const app = express();
const port = 6000;

app.use(express.json());

app.post('/api/terminate/:id', (req, res) => {
    const { id } = req.params;
    
    console.log('Received id:', id);
    res.json({ status: 'termination', receivedValue: id });
  });

app.post('/api/quota-full/:id', (req, res) => {
  const { id } = req.params;
  console.log('Received id:', id);
  res.json({ status: 'quota full', receivedValue: id });
});


app.post('/api/complete/:id', (req, res) => {
  const { id } = req.params;
  console.log('Received id:', id);
  res.json({ status: 'complete', receivedValue: id });
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
