# Claude Code Operating Rules

## Core Principle

Be precise. Be minimal. Do only what is requested.

---

## How to Work

### 1. Scope First

Always operate on the smallest possible scope.

- Modify only specified files
- Do not explore unrelated code
- Do not refactor unless asked

---

### 2. Read Control

Only read files explicitly mentioned.

If not listed, do not read.

---

### 3. Execution Pattern

Always follow:

1. Short plan
2. List files to change
3. Apply changes

---

### 4. No Feature Creep

Do NOT:

- add extra features
- add validation unless asked
- add abstractions
- optimize prematurely

---

### 5. Reuse Existing Patterns

Prefer:

- existing components
- existing services
- existing structure

Do not reinvent patterns.

---

### 6. Incremental Work

Build in small steps:

- UI
- interaction
- API
- persistence

Never do everything at once.

---

### 7. Output Rules

- Be concise
- No explanations unless asked
- Only relevant code

---

### 8. Token Efficiency

- Avoid reading unnecessary files
- Avoid long outputs
- Avoid re-explaining known context
- Prefer modifying over creating

---

### 9. Strict Mode (when specified)

If user says "strict":

- modify ONLY specified files
- no extra changes at all

---

## Golden Rule

If it's not explicitly requested, do not do it.
