import React from 'react'

export interface AppProps {}

export const App: React.FC<AppProps> = () => {
  return (
    <>
      <style>
        {`
              body {
                font-family: system-ui, -apple-system, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
              }
              .container {
                text-align: center;
                padding: 2rem;
              }
              h1 {
                font-size: 3rem;
                margin-bottom: 1rem;
              }
              .links {
                display: flex;
                gap: 2rem;
                justify-content: center;
                margin-top: 2rem;
              }
              a {
                display: inline-block;
                padding: 1rem 2rem;
                background: white;
                color: #667eea;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                font-size: 1.2rem;
                transition: transform 0.2s, box-shadow 0.2s;
              }
              a:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 20px rgba(0,0,0,0.2);
              }
              `}
      </style>
      <div className="container">
        <h1>🚀 Awesome Website</h1>
        <p>Choose your destination:</p>
        <div className="links">
          <a href="./website/">Website</a>
          <a href="./registry/">Registry</a>
        </div>
      </div>
    </>
  )
}
