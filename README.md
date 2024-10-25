# AST Converter and Evaluator

This is a React application that allows users to convert queries into Abstract Syntax Trees (ASTs), combine multiple ASTs, and evaluate them against user data. It serves as a useful tool for developers and data analysts working with complex queries.

## Features

- **Convert Queries to AST**: Input a query and receive its corresponding AST.
- **Combine Multiple ASTs**: Combine several ASTs into a single representation.
- **Evaluate AST**: Evaluate an AST against user-provided data to get results.

## Technologies Used

- React
- CSS for styling
- Fetch API for server communication

## Base URL

The application communicates with an API hosted at:

```
https://prabhat-ats.netlify.app
```

## Setup Instructions

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Install Dependencies**:
   Ensure you have Node.js installed, then run:
   ```bash
   npm install
   ```

3. **Start the Application**:
   ```bash
   npm start
   ```
   This will start the development server and open the application in your default web browser.

## Usage

1. **Convert to AST**:
   - Input your query in the designated text field and click "Convert" to get the AST representation.

2. **Combine Queries**:
   - Use the "Add Another Query" button to input multiple queries.
   - Click "Combine" to merge them into a single AST.

3. **Evaluate AST**:
   - Paste the AST JSON and user data (also in JSON format) into their respective fields.
   - Click "Evaluate" to process the AST with the provided user data.

## Loading Indicators

While processing requests (converting, combining, evaluating), loading indicators will inform you that the application is working.

## Error Handling

Errors encountered during API calls are logged to the console. Make sure to check the console for any issues during the interaction.

## Contributing

If you want to contribute to this project, please create a fork of the repository and submit a pull request with your changes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

- Thanks to the developers of React and the API that powers this application.
