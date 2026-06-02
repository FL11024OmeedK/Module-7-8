# React
## 1. What is the difference between React and React Native?

React (also called React.js or ReactDOM) is a JavaScript library for building web applications that run in a browser. It renders components as HTML DOM elements.

React Native is a framework for building native mobile applications (iOS and Android) using React. Instead of rendering HTML, it renders native mobile UI components (like View, Text, and TouchableOpacity). The JavaScript logic is shared, but the output is a real native app — not a web view.

---

## 2. Is React a framework or library? What is the difference?

React is a library, not a framework.

A library does one specific thing well and you call it when you need it — you remain in control of the application flow. A framework dictates the overall structure of your application and calls your code ("inversion of control"). Angular is an example of a framework.

React handles only the view layer (rendering UI). For routing, state management, and data fetching, you choose your own tools. That freedom is the hallmark of a library.

---

## 3. What are the differences between HTML and JSX?

HTML is a markup language natively understood by browsers, with a fixed set of tags and attributes (e.g., `class`, `for`).

JSX is a JavaScript syntax extension used in React that looks like HTML but compiles down to JavaScript function calls (`React.createElement(...)`). Key differences: JSX uses `className` instead of `class`, `htmlFor` instead of `for`, requires all tags to be self-closing (`<img />`), and lets you embed JavaScript expressions directly using curly braces `{}`.

---

## 4. What makes React attractive for our case?

React fits naturally into the MERN stack because it is JavaScript all the way through — the same language is used on the frontend (React), backend (Node/Express), and database layer (MongoDB/Mongoose). Its component model produces reusable, maintainable UI pieces, and it pairs seamlessly with a REST API served by Express, making full-stack development feel cohesive. React also has a massive ecosystem and is widely used in industry, making it a practical choice for any modern web project.

---

## 5. Components, Props, and State

### What Components Are

Components are the building blocks of a React application. Each component is a self-contained, reusable piece of UI — think of them like custom HTML tags you define yourself. A component can be a button, a form, a navigation bar, or an entire page. Components are written as functions (or classes) that return JSX describing what should appear on screen. Breaking an app into components makes the code easier to reason about, test, and reuse across the project.

### What Props Are

Props (short for "properties") are the mechanism for passing data into a component from its parent. They are read-only — a component receives props but never modifies them directly. Think of props like arguments to a function: the parent decides what values to pass, and the child component uses them to render itself accordingly. For example, a `Button` component might receive a `label` prop so the same component can display "Submit", "Cancel", or any other text depending on where it is used.

### What State Is

State is data that lives inside a component and can change over time in response to user actions or other events. Unlike props, state is managed by the component itself. When state changes, React automatically re-renders the component to reflect the new data. For example, a counter component stores the current count in state — every time the user clicks a button, the state updates and the displayed number changes. In functional components, state is managed with the `useState` hook.


# MERN

## What are a few alternate tech stacks?

There are several popular alternatives to MERN depending on the project's needs:

- **MEAN** (MongoDB, Express, Angular, Node.js) — identical to MERN but swaps React for Angular, a full opinionated framework rather than a library.
- **LAMP** (Linux, Apache, MySQL, PHP) — a classic server-rendered stack widely used for content-heavy sites like WordPress.
- **Django + React** (Python, Django, PostgreSQL, React) — favored in data-science-adjacent projects where Python is already in use on the backend.
- **Ruby on Rails + React** — Rails handles the backend API and React drives the frontend; popular in startups for its rapid development model.
- **Next.js (full-stack)** — a React-based framework that handles both frontend and backend in one project, often deployed serverlessly.

---

## Why is MERN a good choice for full-stack development?

MERN is a strong choice for full-stack development for several reasons. First, it is JavaScript end-to-end — the same language runs on the client (React), the server (Node.js + Express), and interfaces with the database (MongoDB via Mongoose). This means developers can work across the entire stack without switching languages or mental models, which speeds up development and reduces friction on small teams.

Second, MongoDB's document-based, schema-flexible storage maps naturally to the JSON data that JavaScript already works with, so data flows cleanly from the database through the API to the frontend with minimal transformation.

Third, every piece of the MERN stack is open source with massive communities, extensive documentation, and a rich ecosystem of packages on npm. This makes it easy to find solutions, hire developers, and scale the project over time. For a modern web application that needs a responsive UI, a RESTful API, and flexible data storage, MERN covers all the bases in a cohesive, consistent way.

---

## Existing MERN Templates

### [nemanjam/mern-boilerplate](https://github.com/nemanjam/mern-boilerplate)

What stands out about this project is that it ships with three authentication strategies out of the box — local email/password, Facebook OAuth, and Google OAuth — all wired up and ready to use without any extra configuration. It also includes a full production deployment setup using Docker, Nginx, pm2, and a Traefik reverse proxy, which is impressive for a boilerplate and shows how a real-world MERN app would actually be deployed.

### [tamasszoke/mern-seed](https://github.com/tamasszoke/mern-seed)

This template is written entirely in TypeScript, which adds static typing across both the React frontend and the Node/Express backend — something most MERN boilerplates skip. It also includes Socket.IO for real-time communication built in from the start, along with both Jest unit tests and Cypress end-to-end tests, making it one of the more production-ready and thoroughly tested MERN starting points available.