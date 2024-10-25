import React, { useState } from 'react';
import './App.css';

const BASE_URL = "https://ats-server-qau7.onrender.com/api";

const App = () => {
  const [query, setQuery] = useState('');
  const [combineQueries, setCombineQueries] = useState(['']);
  const [ast, setAst] = useState('');
  const [userData, setUserData] = useState('');
  const [convertResult, setConvertResult] = useState(null);
  const [combineResult, setCombineResult] = useState(null);
  const [evaluationResult, setEvaluationResult] = useState(null);

  const [loadingConvert, setLoadingConvert] = useState(false);
  const [loadingCombine, setLoadingCombine] = useState(false);
  const [loadingEvaluate, setLoadingEvaluate] = useState(false);

  const handleConvertToAST = async () => {
    setLoadingConvert(true);
    try {
      const response = await fetch(`${BASE_URL}/rules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ruleString: query })
      });
      const result = await response.json();
      setConvertResult(result);
    } catch (error) {
      console.error('Error converting to AST:', error);
    }
    setLoadingConvert(false);
  };

  const handleCombineAST = async () => {
    setLoadingCombine(true);
    try {
      const response = await fetch(`${BASE_URL}/rules/combine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rules: combineQueries })
      });
      const result = await response.json();
      setCombineResult(result);
    } catch (error) {
      console.error('Error combining AST:', error);
    }
    setLoadingCombine(false);
  };

  const handleEvaluateAST = async () => {
    setLoadingEvaluate(true);
    try {
      const response = await fetch(`${BASE_URL}/rules/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ast: JSON.parse(ast), data: JSON.parse(userData) })
      });
      const result = await response.json();
      setEvaluationResult(result);
    } catch (error) {
      console.error('Error evaluating AST:', error);
    }
    setLoadingEvaluate(false);
  };

  const addQueryInput = () => {
    setCombineQueries([...combineQueries, '']);
  };

  const removeQueryInput = (index) => {
    const newQueries = [...combineQueries];
    newQueries.splice(index, 1);
    setCombineQueries(newQueries);
  };

  const handleQueryChange = (index, value) => {
    const newQueries = [...combineQueries];
    newQueries[index] = value;
    setCombineQueries(newQueries);
  };

  return (
    <div className="app-container">
      {/* Section 1: Convert to AST */}
      <div className="section">
        <h2>Convert to AST</h2>
        <input
          type="text"
          placeholder="Enter query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button onClick={handleConvertToAST}>Convert</button>
        {loadingConvert && <div className="loader">Loading...</div>}
        {convertResult && (
          <div className="result">
            <h4>AST Result:</h4>
            <pre>{JSON.stringify(convertResult, null, 2)}</pre>
          </div>
        )}
      </div>

      {/* Section 2: Combine Queries */}
      <div className="section">
        <h2>Combine Queries to AST</h2>
        {combineQueries.map((combineQuery, index) => (
          <div key={index}>
            <input
              type="text"
              placeholder={`Enter query ${index + 1}`}
              value={combineQuery}
              onChange={(e) => handleQueryChange(index, e.target.value)}
            />
            {index > 0 && (
              <button onClick={() => removeQueryInput(index)}>Remove</button>
            )}
          </div>
        ))}
        <button onClick={addQueryInput}>Add Another Query</button>
        <button onClick={handleCombineAST}>Combine</button>
        {loadingCombine && <div className="loader">Loading...</div>}
        {combineResult && (
          <div className="result">
            <h4>Combined AST Result:</h4>
            <pre>{JSON.stringify(combineResult, null, 2)}</pre>
          </div>
        )}
      </div>

      {/* Section 3: Evaluate AST */}
      <div className="section">
        <h2>Evaluate AST</h2>
        <textarea
          placeholder="Enter AST JSON"
          value={ast}
          onChange={(e) => setAst(e.target.value)}
        />
        <textarea
          placeholder="Enter user data (JSON)"
          value={userData}
          onChange={(e) => setUserData(e.target.value)}
        />
        <button onClick={handleEvaluateAST}>Evaluate</button>
        {loadingEvaluate && <div className="loader">Loading...</div>}
        {evaluationResult !== null && (
          <div className="result">
            <h4>Evaluation Result:</h4>
            <pre>{JSON.stringify(evaluationResult, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
