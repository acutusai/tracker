const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();

app.use(cors({
  origin: 'http://localhost:5173'
}));

const dbms = new sqlite3.Database('additional_urls.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the additional_urls database.');
  }
});

dbms.serialize(() => {
  dbms.run(`
    CREATE TABLE IF NOT EXISTS urls (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      maskedUrl TEXT,
      complete TEXT,
      quotafull TEXT,
      termination TEXT
    )
  `);
});

app.use(bodyParser.json());

const db = new sqlite3.Database('survey_data.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS infotable (id INTEGER PRIMARY KEY AUTOINCREMENT, rid TEXT UNIQUE)');
});

const getRedirectUrl = (action, callback) => {
  dbms.get(`SELECT ${action} FROM urls ORDER BY id DESC LIMIT 1`, (err, row) => {
    if (err) {
      console.error('Database error:', err.message);
      return callback(err);
    }
    if (row && row[action]) {
      callback(null, row[action]);
    } else {
      callback(new Error('URL not found for action: ' + action));
    }
  });
};

app.post('/api/surveys/terminate/:id', async (req, res) => {
  const { id } = req.params;

  getRedirectUrl('termination', async (err, redirectUrl) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to get redirect URL' });
    }

    try {
      const response = await axios.post(redirectUrl, { id });
      res.status(200).json({ message: `Survey with RID ${id} terminated.`, response: response.data });
    } catch (error) {
      console.error('Error posting data:', error.message);
      res.status(500).json({ error: 'Failed to post data to redirect URL' });
    }
  });
});

app.post('/api/surveys/quota-full/:id', async (req, res) => {
  const { id } = req.params;

  getRedirectUrl('quotafull', async (err, redirectUrl) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to get redirect URL' });
    }

    try {
      const response = await axios.post(redirectUrl, { id });
      res.status(200).json({ message: `Survey with RID ${id} marked as quota full.`, response: response.data });
    } catch (error) {
      console.error('Error posting data:', error.message);
      res.status(500).json({ error: 'Failed to post data to redirect URL' });
    }
  });
});

app.post('/api/surveys/complete/:id', async (req, res) => {
  const { id } = req.params;

  getRedirectUrl('complete', async (err, redirectUrl) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to get redirect URL' });
    }

    try {
      const response = await axios.post(redirectUrl, { id });
      res.status(200).json({ message: `Survey with RID ${id} completed.`, response: response.data });
    } catch (error) {
      console.error('Error posting data:', error.message);
      res.status(500).json({ error: 'Failed to post data to redirect URL' });
    }
  });
});

app.post('/api/save-links', (req, res) => {
  const { maskedUrl, complete, quotafull, termination } = req.body;

  if (!maskedUrl || !complete || !quotafull || !termination) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  dbms.run(`
    INSERT INTO urls (maskedUrl, complete, quotafull, termination)
    VALUES (?, ?, ?, ?)`,
    [maskedUrl, complete, quotafull, termination], 
    function (err) {
      if (err) {
        console.error('Database error:', err.message);
        return res.status(500).json({ error: 'Failed to save data' });
      }
      console.log('Data saved successfully');
      res.status(201).json({ id: this.lastID, message: 'Data saved successfully' });
    }
  );
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});









// const express = require('express');
// const bodyParser = require('body-parser');
// const axios = require('axios');
// const sqlite3 = require('sqlite3').verbose();
// const cors = require('cors');

// const app = express();

// app.use(cors({
//   origin: 'http://localhost:5173'
// }));

// const dbms = new sqlite3.Database('additional_urls.db', (err) => {
//   if (err) {
//     console.error('Error opening database:', err.message);
//   } else {
//     console.log('Connected to the additional_urls database.');
//   }
// });

// dbms.serialize(() => {
//   dbms.run(`
//     CREATE TABLE IF NOT EXISTS urls (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       maskedUrl TEXT,
//       complete TEXT,
//       quotafull TEXT,
//       termination TEXT
//     )
//   `);
// });

// app.use(bodyParser.json());

// const db = new sqlite3.Database('survey_data.db', (err) => {
//   if (err) {
//     console.error('Error opening database:', err.message);
//   } else {
//     console.log('Connected to the SQLite database.');
//   }
// });

// db.serialize(() => {
//   db.run('CREATE TABLE IF NOT EXISTS infotable (id INTEGER PRIMARY KEY AUTOINCREMENT, rid TEXT UNIQUE)');
// });

// const getRedirectUrl = (action, callback) => {
//   dbms.get(`SELECT ${action} FROM urls ORDER BY id DESC LIMIT 1`, (err, row) => {
//     if (err) {
//       console.error('Database error:', err.message);
//       return callback(err);
//     }
//     if (row && row[action]) {
//       callback(null, row[action]);
//     } else {
//       callback(new Error('URL not found for action: ' + action));
//     }
//   });
// };

// app.post('/api/surveys/terminate/:id', async (req, res) => {
//   const { id } = req.params;

//   getRedirectUrl('termination', async (err, redirectUrl) => {
//     if (err) {
//       return res.status(500).json({ error: 'Failed to get redirect URL' });
//     }

//     // db.get('SELECT rid FROM infotable WHERE id = ?', [id], async (err, row) => {
//     //   if (err) {
//     //     console.error('Database error:', err.message);
//     //     return res.status(500).json({ error: 'Failed to retrieve RID' });
//     //   }

//       // if (row) {
//       //   const rid = row.rid;
//       //   console.log('Completing survey with RID:', rid);
//       //   console.log('Redirect URL:', redirectUrl);

//         try {
//           const response = await axios.post(redirectUrl, { id });
//           res.status(200).json({ message: `Survey with RID ${id} completed.`, response: response.data });
//         } catch (error) {
//           console.error('Error posting data:', error.message);
//           res.status(500).json({ error: 'Failed to post data to redirect URL' });
//       //   }
//       // } else {
//       //   res.status(404).json({ error: 'No matching record found' });
//       // }
//     });
// });

// app.post('/api/surveys/quota-full/:id', async (req, res) => {
//   const { id } = req.params;

//   getRedirectUrl('quotafull', async (err, redirectUrl) => {
//     if (err) {
//       return res.status(500).json({ error: 'Failed to get redirect URL' });
//     }

//     // db.get('SELECT rid FROM infotable WHERE id = ?', [id], async (err, row) => {
//     //   if (err) {
//     //     console.error('Database error:', err.message);
//     //     return res.status(500).json({ error: 'Failed to retrieve RID' });
//     //   }

//       // if (row) {
//       //   const rid = row.rid;
//       //   console.log('Completing survey with RID:', rid);
//       //   console.log('Redirect URL:', redirectUrl);

//         try {
//           const response = await axios.post(redirectUrl, { id });
//           res.status(200).json({ message: `Survey with RID ${id} completed.`, response: response.data });
//         } catch (error) {
//           console.error('Error posting data:', error.message);
//           res.status(500).json({ error: 'Failed to post data to redirect URL' });
//       //   }
//       // } else {
//       //   res.status(404).json({ error: 'No matching record found' });
//       // }
//     });
// });

// app.post('/api/surveys/complete/:id', async (req, res) => {
//   const { id } = req.params;

//   getRedirectUrl('complete', async (err, redirectUrl) => {
//     if (err) {
//       return res.status(500).json({ error: 'Failed to get redirect URL' });
//     }

//     // db.get('SELECT rid FROM infotable WHERE id = ?', [id], async (err, row) => {
//     //   if (err) {
//     //     console.error('Database error:', err.message);
//     //     return res.status(500).json({ error: 'Failed to retrieve RID' });
//     //   }

//       // if (row) {
//       //   const rid = row.rid;
//       //   console.log('Completing survey with RID:', rid);
//       //   console.log('Redirect URL:', redirectUrl);

//         try {
//           const response = await axios.post(redirectUrl, { id });
//           res.status(200).json({ message: `Survey with RID ${id} completed.`, response: response.data });
//         } catch (error) {
//           console.error('Error posting data:', error.message);
//           res.status(500).json({ error: 'Failed to post data to redirect URL' });
//       //   }
//       // } else {
//       //   res.status(404).json({ error: 'No matching record found' });
//       // }
//     };
// }});

// app.post('/api/save-links', (req, res) => {
//   const { maskedUrl, complete, quotafull, termination } = req.body;

//   if (!maskedUrl || !complete || !quotafull || !termination) {
//     return res.status(400).json({ error: 'All fields are required' });
//   }

//   dbms.run(`
//     INSERT INTO urls (maskedUrl, complete, quotafull, termination)
//     VALUES (?, ?, ?, ?)`,
//     [maskedUrl, complete, quotafull, termination], 
//     function (err) {
//       if (err) {
//         console.error('Database error:', err.message);
//         return res.status(500).json({ error: 'Failed to save data' });
//       }
//       console.log('Data saved successfully');
//       res.status(201).json({ id: this.lastID, message: 'Data saved successfully' });
//     }
//   );
// });

// const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });
