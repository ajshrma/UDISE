# UDISE Backend Server

A robust Express.js backend server for the UDISE Dashboard, featuring JWT authentication, MongoDB Atlas integration, and comprehensive school data management.

## Features

- 🚂 **Express.js** - Fast and minimalist web framework
- 🍃 **MongoDB Atlas** - Cloud-based NoSQL database
- 🔒 **JWT Authentication** - Secure user authentication with refresh tokens
- 🎯 **REST API** - Clean and intuitive API architecture
- 📊 **School Data Management** - Complete CRUD operations for school data
- 🔧 **Data Processing** - Kaggle dataset import and processing utilities

## Quick Start

1. Clone the repository:
```bash
git clone https://github.com/your-username/udise-dashboard.git
cd udise-dashboard/MERN-boilerplate/server
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Create `.env` file in server directory
   - Add your secrets to the `.env` file

4. Run the development server:
```bash
node app.js
```

## Project Structure

```
server/
├── src/
│   ├── controllers/       # API controllers
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middlewares/      # Authentication middleware
│   ├── lib/             # Utility libraries
│   └── config/          # Database configuration
├── data/                # Kaggle dataset files
└── *.js                 # Data processing scripts
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

Asad Iqbal
- LinkedIn: [the-asad-iqbal](https://www.linkedin.com/in/the-asad-iqbal/)
- Github: [the-asad-iqbal](https://github.com/the-asad-iqbal)
