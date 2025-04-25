#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

async function generateHtmlReport() {
  try {
    // Read CSV file
    const csvPath = path.join(rootDir, 'docs', 'code_metrics.csv');
    const csvContent = await fs.promises.readFile(csvPath, 'utf8');
    const lines = csvContent.trim().split('\n');
    
    // Parse CSV
    const headers = lines[0].split(',');
    const data = lines.slice(1).map(line => {
      const values = line.split(',');
      return {
        file_path: values[0],
        description: values[1],
        lines_of_code: parseInt(values[2], 10)
      };
    });
    
    // Total lines of code
    const totalLoc = data.reduce((sum, item) => sum + item.lines_of_code, 0);
    
    // Calculate percentage for each file
    data.forEach(item => {
      item.percentage = (item.lines_of_code / totalLoc * 100).toFixed(1);
    });
    
    // Generate HTML
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Code Metrics Report</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      margin: 0;
      padding: 20px;
      color: #333;
    }
    h1 {
      color: #2c3e50;
      border-bottom: 2px solid #3498db;
      padding-bottom: 10px;
    }
    .summary {
      background-color: #f8f9fa;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 20px;
      border-left: 4px solid #3498db;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      padding: 12px 15px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background-color: #f2f2f2;
      font-weight: bold;
    }
    tr:hover {
      background-color: #f5f5f5;
    }
    .bar-container {
      width: 100%;
      background-color: #e0e0e0;
      border-radius: 4px;
      height: 20px;
    }
    .bar {
      height: 20px;
      background-color: #3498db;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <h1>Code Metrics Report</h1>
  
  <div class="summary">
    <h2>Summary</h2>
    <p>Total files analyzed: ${data.length}</p>
    <p>Total lines of code: ${totalLoc.toLocaleString()}</p>
    <p>Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
  </div>
  
  <h2>Metrics by File</h2>
  <table>
    <thead>
      <tr>
        <th>File Path</th>
        <th>Description</th>
        <th>Lines of Code</th>
        <th>% of Codebase</th>
        <th>Distribution</th>
      </tr>
    </thead>
    <tbody>
      ${data.map(item => `
      <tr>
        <td>${item.file_path}</td>
        <td>${item.description}</td>
        <td>${item.lines_of_code}</td>
        <td>${item.percentage}%</td>
        <td>
          <div class="bar-container">
            <div class="bar" style="width: ${item.percentage}%"></div>
          </div>
        </td>
      </tr>
      `).join('')}
    </tbody>
  </table>
</body>
</html>`;

    // Write HTML file
    const htmlPath = path.join(rootDir, 'docs', 'code_metrics.html');
    await fs.promises.writeFile(htmlPath, html);
    
    console.log(`HTML report generated at ${htmlPath}`);
  } catch (err) {
    console.error('Error generating HTML report:', err);
  }
}

generateHtmlReport();