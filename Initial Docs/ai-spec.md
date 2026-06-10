# 🤖 AI_SPEC — Project Specification (Main)

> 🚨 **Important: Delete all placeholder text marked with `>` (including this line) and replace it with your own project-specification content.**
>
> Add this file to the root directory of your project at **`/docs/ai/AI_SPEC.md`**.
>
> This document is the **main AI specification** for your project.
> Its role is to explain the **overall context, scope, structure, and rules** of the project.
>
> AI tools (such as GitHub Copilot in Agent Mode) will rely on this file to understand:
>
> - What the project is
> - What should (and should not) be built
> - How the project is organized
>  
> Before starting, read each section carefully.
> When you understand it, **remove the explanation** and replace it with your own project content.

---

## Project Identity

> This section answers the question: *“What is this project?”*
>
> Keep it short and clear. Anyone (human or AI) should understand the project in a few seconds.

- **Project Name:**
- **Short Description:**  
  > 1–2 sentences describing what the project does.
- **Project Type:**  
  > Example: Static Website, JavaScript App, Express API, MERN App, Java Server, Mobile App (Expo)

---

## Goal and Scope

### Goal

> Describe the **main objective** of the project.
> Focus on *what the project must accomplish*, not how it is implemented.

### In Scope (Build Now)

> List what **must be built** for this project or module.
>
> This helps the AI avoid adding features that are not required.

### Out of Scope (Do NOT Build)

> List what **must not be built**, even if it sounds useful.
>
> This is extremely important to prevent:
>
> - Feature creep
> - Over-engineering
> - Unnecessary complexity

---

## Users and Use Cases

> This section explains **who uses the project** and **what they can do**.
>
> Keep it simple. Most junior projects have only 1–3 user types.
>
> Example format:
>
> - **User Type:** what they can do
> - **User Type:** what they can do

---

## Feature Index (Links Only)

> This is **not** where you describe features.
>
> This section is only a **navigation map** for the AI and the student.
> Each feature listed here must have its **own AI feature specification file**.
>
> Example:
>
> - `ai_feature_contact_form.md`
> - `ai_feature_fetch_products.md`

---

## Pages / Screens / Routes (Project Map)

> This section explains **how the project is structured from a user or API perspective**.
>
> It helps the AI understand:
>
> - Navigation between pages or screens
> - Available API routes
> - What exists before writing code

### If Website / Frontend Project

> List each page or screen and its purpose.
>
> Example:
>
> - `/index.html` — homepage
> - `/contact.html` — contact form

### If Backend / API Project

> List endpoints and what they do (no implementation details).
>
> Example:
>
> - `GET /products` — return product list
> - `POST /orders` — create a new order

---

## Data and Models (Simple)

> This section explains **what data exists** in the project.
>
> Keep it **conceptual**, not technical.
> Do not write full schemas unless required.

### If No Database

> Describe the data used in forms, fetch requests, or JavaScript objects.
>
> Example:
>
> - Contact form data: name, email, message

### If Database Exists

> Describe:
>
> - Database type
> - Main collections or tables
> - Important fields (only the essentials)

---

## Tech Stack and Tools

> This section tells the AI **which technologies are allowed and expected**.
>
> It prevents the AI from:
>
> - Using the wrong framework
> - Introducing advanced or unknown tools
> - Mixing incompatible technologies

### Frontend

> Technologies used to build the user interface.
>
> Examples:
>
> - HTML, CSS, JavaScript
> - React
> - React Native (Expo)

### Backend

> Technologies used to handle logic, APIs, or servers.
>
> Examples:
>
> - Node.js with Express
> - Java with Spring Boot
> - No backend (static site)

### Database (if any)

> Technology used to store data.
>
> Examples:
>
> - MongoDB
> - PostgreSQL
> - None (data is not persisted)

### Tools / Libraries

> Additional tools or libraries that may be used.
>
> Examples:
>
> - Fetch API
> - Axios
> - React Router
> - Mongoose

---

## Repository Structure

> This section helps the AI understand **where to place files**.
>
> It avoids random file creation and keeps the project organized.
>
> Example:
>
> - `/client` — frontend code
> - `/server` — backend code
> - `/src/components`
> - `/routes`

---

## Rules for the AI

> These are **strict rules** the AI must follow when generating code or explanations.
>
> Keep this list short and clear.
>
> Example rules:
>
> - Use junior-friendly code
> - Avoid advanced patterns
> - Do not add features not listed
> - Reuse existing files when possible
> - Explain changes briefly

---

## How to Run / Test the Project

> This section explains **how to start and test the project**.
>
> The AI will use this to:
>
> - Suggest correct commands
> - Avoid incorrect setup steps
>
> Example:
>
> - Install dependencies
> - Run the project
> - Open URL or test endpoint
> - Environment variables (if any)

---

## Definition of Done

> This section defines **when the project is considered complete**.
>
> It acts as:
>
> - A final checklist for students
> - A validation guide for the AI
>  
> If all items are checked, the project is finished.
>
> Example checklist:
>
> - [ ] Project runs without errors
> - [ ] Required features are implemented
> - [ ] Basic UI or API works as expected
> - [ ] Code is readable and organized
