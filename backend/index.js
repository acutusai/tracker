const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();

// Middleware setup
app.use(cors({
  origin: 'https://opiniomea.com'
}));
app.use(bodyParser.json());

// MySQL database connection setup (as you had before)
const dbms = mysql.createConnection({
  host: 'localhost',
  user: 'u411184336_Aditya_1234',
  password: 'Acutusai_2468',
  database: 'u411184336_urldata'
});

const db = mysql.createConnection({
  host: 'localhost',
  user: 'u411184336_Aditya_123',
  password: 'Acutusai_2468',
  database: 'u411184336_surveydata'
});

// Handle connection errors
dbms.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL additional_urls database:', err.message);
  } else {
    console.log('Connected to the additional_urls MySQL database.');
  }
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL survey_data database:', err.message);
  } else {
    console.log('Connected to the survey_data MySQL database.');
  }
});

// Create tables if they don't exist (as you had before)
dbms.query(`
  CREATE TABLE IF NOT EXISTS urls (
    id INT AUTO_INCREMENT PRIMARY KEY,
    projectName VARCHAR(255),
    maskedUrl VARCHAR(255),
    complete VARCHAR(255),
    quotafull VARCHAR(255),
    termination VARCHAR(255),
    uniqueId VARCHAR(255) UNIQUE
  )
`, (err) => {
  if (err) {
    console.error('Error creating table in additional_urls database:', err.message);
  }
});

db.query(`
  CREATE TABLE IF NOT EXISTS infotable (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rid VARCHAR(255) UNIQUE
  )
`, (err) => {
  if (err) {
    console.error('Error creating table in survey_data database:', err.message);
  }
});

// Function to get redirect URLs by uniqueId
const getRedirectUrlsByUniqueId = (uniqueId, callback) => {
  dbms.query('SELECT complete, quotafull, termination FROM urls WHERE uniqueId = ?', [uniqueId], (err, results) => {
    if (err) {
      console.error('Database error:', err.message);
      return callback(err);
    }
    if (results.length > 0) {
      callback(null, results[0]);
    } else {
      callback(new Error('No URLs found for uniqueId: ' + uniqueId));
    }
  });
};

// Update your routes to include the /api prefix
app.post('/api/surveys/terminate/:unique/:id', async (req, res) => {
  const { unique } = req.params;
  const { id } = req.params;

  getRedirectUrlsByUniqueId(unique, async (err, urls) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to get redirect URLs' });
    }

    try {
      const response = await axios.post(`${urls.termination}/${id}`);
      res.status(200).json({ message: `Survey with RID ${id} terminated.`, response: response.data });
    } catch (error) {
      console.error('Error posting data:', error.message);
      res.status(500).json({ error: 'Failed to post data to termination URL' });
    }
  });
});

app.post('/api/surveys/quota-full/:unique/:id', async (req, res) => {
  const { unique } = req.params;
  const { id } = req.params;

  getRedirectUrlsByUniqueId(unique, async (err, urls) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to get redirect URLs' });
    }

    try {
      const response = await axios.post(urls.quotafull, { id });
      res.status(200).json({ message: `Survey with RID ${id} marked as quota full.`, response: response.data });
    } catch (error) {
      console.error('Error posting data:', error.message);
      res.status(500).json({ error: 'Failed to post data to quota-full URL' });
    }
  });
});

app.post('/api/surveys/complete/:unique/:id', async (req, res) => {
  const { unique } = req.params;
  const { id } = req.params;

  getRedirectUrlsByUniqueId(unique, async (err, urls) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to get redirect URLs' });
    }

    try {
      const response = await axios.post(urls.complete, { id });
      res.status(200).json({ message: `Survey with RID ${id} completed.`, response: response.data });
    } catch (error) {
      console.error('Error posting data:', error.message);
      res.status(500).json({ error: 'Failed to post data to complete URL' });
    }
  });
});

app.post('/api/save-links', (req, res) => {
  const { uniqueId, projectName, maskedUrl, complete, quotafull, termination } = req.body;

  if (!uniqueId || !projectName || !maskedUrl || !complete || !quotafull || !termination) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  dbms.query(`
    INSERT INTO urls (uniqueId, projectName, maskedUrl, complete, quotafull, termination)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [uniqueId, projectName, maskedUrl, complete, quotafull, termination],
    (err, results) => {
      if (err) {
        console.error('Database error:', err.message);
        return res.status(500).json({ error: 'Failed to save data' });
      }
      res.status(201).json({ id: results.insertId, message: 'Data saved successfully' });
    }
  );
});

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


// const express = require('express');
// const bodyParser = require('body-parser');
// const axios = require('axios');
// const mysql = require('mysql2');
// const cors = require('cors');

// const app = express();

// // Middleware setup
// app.use(cors({
//   origin: 'https://opiniomea.com/'
// }));
// app.use(bodyParser.json());

// // MySQL database connection
// const dbms = mysql.createConnection({
//   host: 'localhost', // replace with your host
//   user: 'u411184336_Aditya_1234', // replace with your MySQL username
//   password: 'Acutusai_2468', // replace with your MySQL password
//   database: 'u411184336_urldata' // replace with your database name
// });

// dbms.connect((err) => {
//   if (err) {
//     console.error('Error connecting to MySQL additional_urls database:', err.message);
//   } else {
//     console.log('Connected to the additional_urls MySQL database.');
//   }
// });

// const db = mysql.createConnection({
//   host: 'localhost', // replace with your host
//   user: 'u411184336_Aditya_123', // replace with your MySQL username
//   password: 'Acutusai_2468', // replace with your MySQL password
//   database: 'u411184336_surveydata' // replace with your database name
// });

// db.connect((err) => {
//   if (err) {
//     console.error('Error connecting to MySQL survey_data database:', err.message);
//   } else {
//     console.log('Connected to the survey_data MySQL database.');
//   }
// });

// // Create tables if they don't exist
// dbms.query(`
//   CREATE TABLE IF NOT EXISTS urls (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     projectName VARCHAR(255),
//     maskedUrl VARCHAR(255),
//     complete VARCHAR(255),
//     quotafull VARCHAR(255),
//     termination VARCHAR(255),
//     uniqueId VARCHAR(255) UNIQUE
//   )
// `, (err) => {
//   if (err) {
//     console.error('Error creating table in additional_urls database:', err.message);
//   }
// });

// db.query(`
//   CREATE TABLE IF NOT EXISTS infotable (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     rid VARCHAR(255) UNIQUE
//   )
// `, (err) => {
//   if (err) {
//     console.error('Error creating table in survey_data database:', err.message);
//   }
// });

// // Function to get redirect URLs by uniqueId
// const getRedirectUrlsByUniqueId = (uniqueId, callback) => {
//   dbms.query('SELECT complete, quotafull, termination FROM urls WHERE uniqueId = ?', [uniqueId], (err, results) => {
//     if (err) {
//       console.error('Database error:', err.message);
//       return callback(err);
//     }
//     if (results.length > 0) {
//       callback(null, results[0]);
//     } else {
//       callback(new Error('No URLs found for uniqueId: ' + uniqueId));
//     }
//   });
// };

// // API Endpoints
// app.post('/api/surveys/terminate/:unique/:id', async (req, res) => {
//   const { unique } = req.params;
//   const { id } = req.params;

//   getRedirectUrlsByUniqueId(unique, async (err, urls) => {
//     if (err) {
//       return res.status(500).json({ error: 'Failed to get redirect URLs' });
//     }

//     try {
//       const response = await axios.post(`${urls.termination}/${id}`);
//       res.status(200).json({ message: `Survey with RID ${id} terminated.`, response: response.data });
//     } catch (error) {
//       console.error('Error posting data:', error.message);
//       res.status(500).json({ error: 'Failed to post data to termination URL' });
//     }
//   });
// });

// app.post('/api/surveys/quota-full/:unique/:id', async (req, res) => {
//   const { unique } = req.params;
//   const { id } = req.params;

//   getRedirectUrlsByUniqueId(unique, async (err, urls) => {
//     if (err) {
//       return res.status(500).json({ error: 'Failed to get redirect URLs' });
//     }

//     try {
//       const response = await axios.post(urls.quotafull, { id });
//       res.status(200).json({ message: `Survey with RID ${id} marked as quota full.`, response: response.data });
//     } catch (error) {
//       console.error('Error posting data:', error.message);
//       res.status(500).json({ error: 'Failed to post data to quota-full URL' });
//     }
//   });
// });

// app.post('/api/surveys/complete/:unique/:id', async (req, res) => {
//   const { unique } = req.params;
//   const { id } = req.params;

//   getRedirectUrlsByUniqueId(unique, async (err, urls) => {
//     if (err) {
//       return res.status(500).json({ error: 'Failed to get redirect URLs' });
//     }

//     try {
//       const response = await axios.post(urls.complete, { id });
//       res.status(200).json({ message: `Survey with RID ${id} completed.`, response: response.data });
//     } catch (error) {
//       console.error('Error posting data:', error.message);
//       res.status(500).json({ error: 'Failed to post data to complete URL' });
//     }
//   });
// });

// app.post('/api/save-links', (req, res) => {
//   const { uniqueId, projectName, maskedUrl, complete, quotafull, termination } = req.body;

//   if (!uniqueId || !projectName || !maskedUrl || !complete || !quotafull || !termination) {
//     return res.status(400).json({ error: 'All fields are required' });
//   }

//   dbms.query(`
//     INSERT INTO urls (uniqueId, projectName, maskedUrl, complete, quotafull, termination)
//     VALUES (?, ?, ?, ?, ?, ?)`,
//     [uniqueId, projectName, maskedUrl, complete, quotafull, termination],
//     (err, results) => {
//       if (err) {
//         console.error('Database error:', err.message);
//         return res.status(500).json({ error: 'Failed to save data' });
//       }
//       res.status(201).json({ id: results.insertId, message: 'Data saved successfully' });
//     }
//   );
// });

// const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });



