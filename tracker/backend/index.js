const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const helmet = require('helmet'); // For security headers
const rateLimit = require('express-rate-limit'); // For rate limiting
const morgan = require('morgan'); // For logging

const app = express();

// Middleware setup
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  methods: 'GET,POST,PUT,DELETE',
  credentials: true 
}));
app.use(bodyParser.json());
app.use(helmet()); // Secure HTTP headers
app.use(morgan('combined')); // Logging

// Rate limiter for API requests
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', apiLimiter);

// MongoDB connection setup
const dbURI = process.env.MONGODB_URI || 'your-mongodb-connection-string-here';
mongoose.connect(dbURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Connected to MongoDB database.'))
  .catch((err) => console.error('Error connecting to MongoDB:', err.message));
const initializeDatabase = async () => {
  try {
    const db = mongoose.connection.db;

    // Check if collections exist, and create them if necessary
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);

    if (!collectionNames.includes('projects')) {
      await db.createCollection('projects');
      console.log('Collection "projects" created.');
    }

    if (!collectionNames.includes('urls')) {
      await db.createCollection('urls');
      console.log('Collection "urls" created.');
    }

    if (!collectionNames.includes('info')) {
      await db.createCollection('info');
      console.log('Collection "info" created.');
    }
  } catch (err) {
    console.error('Error during database initialization:', err);
  }
};
// Define schemas and models
const projectSchema = new mongoose.Schema({
  projectName: String,
  uniqueId: String,
  maskedUrl: String,
});

const Project = mongoose.model('Project', projectSchema);

const urlSchema = new mongoose.Schema({
  projectName: String,
  maskedUrl: String,
  complete: String,
  quotafull: String,
  termination: String,
  uniqueId: { type: String, unique: true }
});

const Url = mongoose.model('Url', urlSchema);

const infoSchema = new mongoose.Schema({
  rid: { type: String, unique: true }
});

const Info = mongoose.model('Info', infoSchema);

// Function to get redirect URLs by uniqueId
const getRedirectUrlsByUniqueId = async (uniqueId) => {
  try {
    const result = await Url.findOne({ uniqueId });
    if (result) {
      return result;
    } else {
      throw new Error('No URLs found for uniqueId: ' + uniqueId);
    }
  } catch (err) {
    throw err;
  }
};

// Routes
app.post('/api/surveys/terminate/:unique/:id', async (req, res) => {
  const { unique, id } = req.params;

  try {
    const urls = await getRedirectUrlsByUniqueId(unique);

    const response = await axios.post(`${urls.termination}/${id}`);
    res.status(200).json({ message: `Survey with RID ${id} terminated.`, response: response.data });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Failed to get or post data' });
  }
});

app.post('/api/surveys/quota-full/:unique/:id', async (req, res) => {
  const { unique, id } = req.params;

  try {
    const urls = await getRedirectUrlsByUniqueId(unique);

    const response = await axios.post(urls.quotafull, { id });
    res.status(200).json({ message: `Survey with RID ${id} marked as quota full.`, response: response.data });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Failed to get or post data' });
  }
});

app.post('/api/surveys/complete/:unique/:id', async (req, res) => {
  const { unique, id } = req.params;

  try {
    const urls = await getRedirectUrlsByUniqueId(unique);

    const response = await axios.post(urls.complete, { id });
    res.status(200).json({ message: `Survey with RID ${id} completed.`, response: response.data });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Failed to get or post data' });
  }
});

app.post('/api/save-links', async (req, res) => {
  const { uniqueId, projectName, maskedUrl, complete, quotafull, termination } = req.body;

  if (!uniqueId || !projectName || !maskedUrl || !complete || !quotafull || !termination) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const newUrl = new Url({ uniqueId, projectName, maskedUrl, complete, quotafull, termination });
    await newUrl.save();
    
    const status = process.env.SERVER_URL || 'http://localhost:4000';
    const query = "?id=[%id%]";
    const term = "/api/surveys/terminate/";
    const comp = "/api/surveys/complete/";
    const quote = "/api/surveys/quota-full/";

    const terminationUrl = `${status}/${term}${uniqueId}${query}`;
    const completeUrl = `${status}/${comp}${uniqueId}${query}`;
    const quotaFullUrl = `${status}/${quote}${uniqueId}${query}`;

    res.status(201).json({
      message: 'Data saved successfully',
      terminationUrl,
      completeUrl,
      quotaFullUrl,
    });
  } catch (err) {
    console.error('Error saving data:', err.message);
    res.status(500).json({ error: 'Failed to save data' });
  }
});

app.get('/api/projects', async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

app.get('/api/projects/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

app.post('/api/projects', async (req, res) => {
  const { uniqueId, projectName, maskedUrl } = req.body;

  if (!uniqueId || !projectName || !maskedUrl) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const newProject = new Project({ uniqueId, projectName, maskedUrl });

  try {
    await newProject.save();
    res.status(201).json(newProject);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

app.put('/api/projects/:id', async (req, res) => {
  const { title, description, imageUrl, url, tags } = req.body;

  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { title, description, imageUrl, url, tags },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

app.delete('/api/projects/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// const express = require('express');
// const bodyParser = require('body-parser');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const axios = require('axios');

// const app = express();

// // Middleware setup
// app.use(cors({
//   origin: 'http://localhost:5173',
//   methods: 'GET,POST,PUT,DELETE',
//   credentials: true 
// }));
// app.use(bodyParser.json());

// // MongoDB connection setup
// mongoose.connect('mongodb+srv://adityayadav:mr6i0FIGxN75TRkV@cluster0.xsaca.mongodb.net/', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// })
//   .then(() => console.log('Connected to MongoDB database.'))
//   .catch((err) => console.error('Error connecting to MongoDB:', err.message));

// // Define schemas and models
// const projectSchema = new mongoose.Schema({
//   projectName: String,
//   uniqueId: String,
//   maskedUrl: String,
// });

// const Project = mongoose.model('Project', projectSchema);

// const urlSchema = new mongoose.Schema({
//   projectName: String,
//   maskedUrl: String,
//   complete: String,
//   quotafull: String,
//   termination: String,
//   uniqueId: { type: String, unique: true }
// });

// const Url = mongoose.model('Url', urlSchema);

// const infoSchema = new mongoose.Schema({
//   rid: { type: String, unique: true }
// });

// const Info = mongoose.model('Info', infoSchema);

// // Function to get redirect URLs by uniqueId
// const getRedirectUrlsByUniqueId = async (uniqueId) => {
//   try {
//     const result = await Url.findOne({ uniqueId });
//     if (result) {
//       return result;
//     } else {
//       throw new Error('No URLs found for uniqueId: ' + uniqueId);
//     }
//   } catch (err) {
//     throw err;
//   }
// };

// // Routes
// app.post('/api/surveys/terminate/:unique/:id', async (req, res) => {
//   const { unique, id } = req.params;

//   try {
//     const urls = await getRedirectUrlsByUniqueId(unique);

//     const response = await axios.post(`${urls.termination}/${id}`);
//     res.status(200).json({ message: `Survey with RID ${id} terminated.`, response: response.data });
//   } catch (error) {
//     console.error('Error:', error.message);
//     res.status(500).json({ error: 'Failed to get or post data' });
//   }
// });

// app.post('/api/surveys/quota-full/:unique/:id', async (req, res) => {
//   const { unique, id } = req.params;

//   try {
//     const urls = await getRedirectUrlsByUniqueId(unique);

//     const response = await axios.post(urls.quotafull, { id });
//     res.status(200).json({ message: `Survey with RID ${id} marked as quota full.`, response: response.data });
//   } catch (error) {
//     console.error('Error:', error.message);
//     res.status(500).json({ error: 'Failed to get or post data' });
//   }
// });

// app.post('/api/surveys/complete/:unique/:id', async (req, res) => {
//   const { unique, id } = req.params;

//   try {
//     const urls = await getRedirectUrlsByUniqueId(unique);

//     const response = await axios.post(urls.complete, { id });
//     res.status(200).json({ message: `Survey with RID ${id} completed.`, response: response.data });
//   } catch (error) {
//     console.error('Error:', error.message);
//     res.status(500).json({ error: 'Failed to get or post data' });
//   }
// });

// app.post('/api/save-links', async (req, res) => {
//   const { uniqueId, projectName, maskedUrl, complete, quotafull, termination } = req.body;

//   if (!uniqueId || !projectName || !maskedUrl || !complete || !quotafull || !termination) {
//     return res.status(400).json({ error: 'All fields are required' });
//   }

//   try {
//     const newUrl = new Url({ uniqueId, projectName, maskedUrl, complete, quotafull, termination });
//     await newUrl.save();
    
//     const status = "http://localhost:4000";
//     const query = "?id=[%id%]";
//     const term = "/api/surveys/terminate/";
//     const comp = "/api/surveys/complete/";
//     const quote = "/api/surveys/quota-full/";


//     const terminationUrl = `${status}/${term}${uniqueId}${query}`;
//     const completeUrl = `${status}/${comp}${uniqueId}${query}`;
//     const quotaFullUrl = `${status}/${quote}${uniqueId}${query}`;

//     res.status(201).json({
//       message: 'Data saved successfully',
//       terminationUrl,
//       completeUrl,
//       quotaFullUrl,
//     });
//   } catch (err) {
//     console.error('Error saving data:', err.message);
//     res.status(500).json({ error: 'Failed to save data' });
//   }
// });

// app.get('/api/projects', async (req, res) => {
//   try {
//     const projects = await Project.find();
//     res.json(projects);
//   } catch (error) {
//     console.error('Error fetching projects:', error);
//     res.status(500).json({ error: 'Failed to fetch projects' });
//   }
// });

// app.get('/api/projects/:id', async (req, res) => {
//   try {
//     const project = await Project.findById(req.params.id);
//     if (!project) {
//       return res.status(404).json({ error: 'Project not found' });
//     }
//     res.json(project);
//   } catch (error) {
//     console.error('Error fetching project:', error);
//     res.status(500).json({ error: 'Failed to fetch project' });
//   }
// });

// app.post('/api/projects', async (req, res) => {
//   const { uniqueId, projectName, maskedUrl} = req.body;
//   const newProject = new Project({ uniqueId, projectName, maskedUrl} );

//   try {
//     await newProject.save();
//     res.status(201).json(newProject);
//   } catch (error) {
//     console.error('Error creating project:', error);
//     res.status(500).json({ error: 'Failed to create project' });
//   }
// });

// app.put('/api/projects/:id', async (req, res) => {
//   const { title, description, imageUrl, url, tags } = req.body;

//   try {
//     const project = await Project.findByIdAndUpdate(
//       req.params.id,
//       { title, description, imageUrl, url, tags },
//       { new: true }
//     );

//     if (!project) {
//       return res.status(404).json({ error: 'Project not found' });
//     }

//     res.json(project);
//   } catch (error) {
//     console.error('Error updating project:', error);
//     res.status(500).json({ error: 'Failed to update project' });
//   }
// });

// app.delete('/api/projects/:id', async (req, res) => {
//   try {
//     const project = await Project.findByIdAndDelete(req.params.id);
//     if (!project) {
//       return res.status(404).json({ error: 'Project not found' });
//     }
//     res.json(project);
//   } catch (error) {
//     console.error('Error deleting project:', error);
//     res.status(500).json({ error: 'Failed to delete project' });
//   }
// });


// const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });
